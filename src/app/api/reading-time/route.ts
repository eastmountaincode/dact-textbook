import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// GET: Retrieve reading time for a chapter (for the authenticated user)
export async function GET(request: Request) {
  try {
    // Check authentication using Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const chapterSlug = searchParams.get('chapterSlug');

    if (!chapterSlug) {
      return NextResponse.json({ error: 'Missing chapterSlug' }, { status: 400 });
    }

    // Look up chapter
    const { data: chapter } = await supabase
      .from('chapters')
      .select('id')
      .eq('slug', chapterSlug)
      .maybeSingle();

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Get reading time
    const { data: readingTime } = await supabase
      .from('reading_time_per_chapter')
      .select('seconds_spent, last_updated')
      .eq('user_id', userId)
      .eq('chapter_id', chapter.id)
      .maybeSingle();

    return NextResponse.json({
      secondsSpent: readingTime?.seconds_spent ?? 0,
      lastUpdated: readingTime?.last_updated ?? null,
    });
  } catch (error) {
    console.error('Error getting reading time:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication using Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Parse request body
    // Support both JSON and sendBeacon (which sends as text)
    let body;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // sendBeacon sends as text/plain
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { chapterSlug, secondsToAdd } = body;

    if (!chapterSlug || typeof secondsToAdd !== 'number') {
      return NextResponse.json(
        { error: 'Missing chapterSlug or secondsToAdd' },
        { status: 400 }
      );
    }

    // Validate secondsToAdd is positive and reasonable
    // Client sends updates every 30 seconds, so 60 is a generous max
    // This prevents abuse (e.g., someone calling API directly with huge values)
    if (secondsToAdd <= 0 || secondsToAdd > 60) {
      return NextResponse.json(
        { error: 'Invalid secondsToAdd value' },
        { status: 400 }
      );
    }

    // Look up chapter by slug (chapters are seeded at build time)
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('slug', chapterSlug)
      .maybeSingle();

    if (chapterError || !chapter) {
      console.error('Chapter not found:', chapterSlug);
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    const chapterId = chapter.id;

    // Get current reading time for this user/chapter
    const { data: existing } = await supabase
      .from('reading_time_per_chapter')
      .select('id, seconds_spent, last_updated')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .maybeSingle();

    // Calculate the actual seconds to add (rate limited)
    let actualSecondsToAdd = secondsToAdd;

    if (existing) {
      // Rate limit: can't add more time than has actually passed since last update
      // This prevents users from inflating time faster than real time
      const lastUpdate = new Date(existing.last_updated).getTime();
      const now = Date.now();
      const secondsSinceLastUpdate = Math.floor((now - lastUpdate) / 1000);
      actualSecondsToAdd = Math.min(secondsToAdd, secondsSinceLastUpdate + 5); // 5s buffer for network latency

      if (actualSecondsToAdd <= 0) {
        // Too soon since last update, silently accept but don't add time
        return NextResponse.json({ success: true });
      }

      // Update existing cumulative record
      const { error: updateError } = await supabase
        .from('reading_time_per_chapter')
        .update({
          seconds_spent: existing.seconds_spent + actualSecondsToAdd,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating reading time:', updateError);
        return NextResponse.json(
          { error: 'Failed to update reading time' },
          { status: 500 }
        );
      }
    } else {
      // Insert new cumulative record
      const { error: insertError } = await supabase
        .from('reading_time_per_chapter')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          seconds_spent: secondsToAdd,
          last_updated: new Date().toISOString(),
        });

      if (insertError) {
        // Handle race condition: if another request just inserted, treat as success
        // The concurrent request already recorded time, so this is fine
        if (insertError.code === '23505') {
          // Still need to update daily table below
        } else {
          console.error('Error inserting reading time:', insertError);
          return NextResponse.json(
            { error: 'Failed to record reading time' },
            { status: 500 }
          );
        }
      }
    }

    // Also update the daily table for date-range queries
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: existingDaily } = await supabase
      .from('reading_time_daily')
      .select('id, seconds_spent')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .eq('date', today)
      .maybeSingle();

    if (existingDaily) {
      await supabase
        .from('reading_time_daily')
        .update({
          seconds_spent: existingDaily.seconds_spent + actualSecondsToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDaily.id);
    } else {
      const { error: dailyInsertError } = await supabase
        .from('reading_time_daily')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          date: today,
          seconds_spent: actualSecondsToAdd,
        });

      // Ignore duplicate key errors (race condition)
      if (dailyInsertError && dailyInsertError.code !== '23505') {
        console.error('Error inserting daily reading time:', dailyInsertError);
        // Don't fail the request - cumulative table was updated successfully
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing reading time:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
