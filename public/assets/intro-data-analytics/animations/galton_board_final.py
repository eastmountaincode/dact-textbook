"""
Galton Board Animation
=====================
Demonstrates how individual random events (Bernoulli trials) aggregate
to form a binomial distribution, which approximates the normal distribution.

Used in: Chapter 1 - The Purpose of Data Analytics
"""

from manim import *
import numpy as np
import random

# UC Berkeley Bright Color Palette (for contrast on black background)
BERKELEY_COLORS = {
    'berkeley_blue': '#003262',
    'california_gold': '#FDB515',      # Bright gold
    'founders_rock': '#3B7EA1',        # Bright blue
    'medalist': '#C4820E',             # Bright bronze/orange
    'bay_fog': '#DDD5C7',              # Light gray
    'lawrence': '#00B0DA',             # Bright cyan
    'sather_gate': '#B9D3B6',          # Bright sage
    'pacific': '#46535E',              # Dark blue-gray
    'soybean': '#859438',              # Bright olive
    'rose_garden': '#EE1F60',          # Bright magenta/rose
    'golden_gate': '#ED4E33',          # Bright red-orange
    'lap_lane': '#00A598',             # Bright teal
    'south_hall': '#6C3302',           # Brown
    'ion': '#CFDD45',                  # Bright yellow-green
    'stone_pine': '#584F29',           # Dark olive
    'grey': '#888888',                 # Medium grey for copyright
}

# Configuration for 16:9 at 1920x1080
config.pixel_height = 1080
config.pixel_width = 1920
config.frame_rate = 60
config.background_color = "#000000"  # Black background

class GaltonBoard(Scene):
    """Galton board showing emergence of normal distribution from random events."""
    
    def construct(self):
        # Parameters
        self.n_rows = 12
        self.peg_spacing = 0.5
        self.ball_radius = 0.06
        self.n_balls = 100  # Reduced for reasonable render time
        
        # Storage for bins
        self.bins_data = []
        self.bin_counts = []
        
        # Title sequence
        self.show_title()
        
        # Build the board
        self.pegs = self.create_pegs()
        self.play(FadeIn(self.pegs, shift=UP, scale=0.8), run_time=2)
        self.wait(0.5)
        
        # Create bins
        self.bins = self.create_bins()
        self.play(Create(self.bins), run_time=1)
        self.wait(0.5)
        
        # Drop balls
        self.drop_all_balls()
        
        # Show the pattern
        self.highlight_pattern()
        
    def show_title(self):
        """Display title and subtitle."""
        title = Text(
            "The Galton Board",
            font="EB Garamond",
            font_size=60,
            color=BERKELEY_COLORS['california_gold'],  # Bright gold
            weight=BOLD
        ).to_edge(UP, buff=0.4)
        
        subtitle = Text(
            "Individual randomness creates collective patterns",
            font="EB Garamond",
            font_size=32,
            color=BERKELEY_COLORS['lawrence'],  # Bright cyan
            weight=NORMAL
        ).next_to(title, DOWN, buff=0.3)
        
        # Copyright notice
        copyright = Text(
            "© 2024 Gautam Sethi",
            font="EB Garamond",
            font_size=18,
            color=BERKELEY_COLORS['grey'],
            weight=NORMAL
        ).to_edge(DOWN, buff=0.3)
        
        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(subtitle, shift=UP), run_time=0.8)
        self.play(FadeIn(copyright), run_time=0.5)
        self.add(copyright)  # Keep it on screen
        self.wait(1.5)
        self.play(
            FadeOut(title, shift=UP),
            FadeOut(subtitle, shift=UP),
            run_time=0.8
        )
        self.wait(0.3)
        # Copyright stays on screen throughout
    
    def create_pegs(self):
        """Create the triangular peg arrangement."""
        pegs = VGroup()
        start_y = 2.8
        
        for row in range(self.n_rows):
            y = start_y - row * self.peg_spacing
            n_pegs = row + 1
            total_width = (n_pegs - 1) * self.peg_spacing
            start_x = -total_width / 2
            
            for col in range(n_pegs):
                x = start_x + col * self.peg_spacing
                
                peg = Dot(
                    point=[x, y, 0],
                    radius=0.05,
                    color=BERKELEY_COLORS['bay_fog'],  # Light gray
                    fill_opacity=0.6,
                    stroke_width=1,
                    stroke_color=WHITE
                )
                pegs.add(peg)
        
        return pegs
    
    def create_bins(self):
        """Create collection bins at the bottom."""
        bins = VGroup()
        n_bins = self.n_rows + 1
        bin_width = self.peg_spacing * 0.85
        
        bottom_y = 2.8 - self.n_rows * self.peg_spacing - 0.5
        total_width = (n_bins - 1) * self.peg_spacing
        start_x = -total_width / 2
        
        # Initialize bin data
        for i in range(n_bins):
            x = start_x + i * self.peg_spacing
            
            # Bin walls
            left_wall = Line(
                start=[x - bin_width/2, bottom_y, 0],
                end=[x - bin_width/2, bottom_y - 2.8, 0],
                color=BERKELEY_COLORS['lawrence'],  # Bright cyan
                stroke_width=3
            )
            
            right_wall = Line(
                start=[x + bin_width/2, bottom_y, 0],
                end=[x + bin_width/2, bottom_y - 2.8, 0],
                color=BERKELEY_COLORS['lawrence'],  # Bright cyan
                stroke_width=3
            )
            
            bins.add(left_wall, right_wall)
            
            # Store bin info
            self.bins_data.append({
                'x': x,
                'bottom_y': bottom_y - 2.8,
                'count': 0
            })
            self.bin_counts.append(0)
        
        return bins
    
    def drop_all_balls(self):
        """Drop all balls with animations."""
        ball_colors = [
            BERKELEY_COLORS['rose_garden'],    # Bright magenta
            BERKELEY_COLORS['california_gold'], # Bright gold
            BERKELEY_COLORS['golden_gate'],    # Bright red-orange
            BERKELEY_COLORS['lawrence'],       # Bright cyan
            BERKELEY_COLORS['lap_lane'],       # Bright teal
            BERKELEY_COLORS['ion'],            # Bright yellow-green
        ]
        
        all_balls = VGroup()
        
        for i in range(self.n_balls):
            # Pick color
            color = ball_colors[i % len(ball_colors)]
            
            # Create ball
            ball = Dot(
                point=[0, 3.8, 0],
                radius=self.ball_radius,
                color=color,
                fill_opacity=0.8,
                stroke_width=0.5,
                stroke_color=WHITE
            )
            
            # Calculate path
            path_points = self.calculate_path()
            
            # Determine landing bin
            final_x = path_points[-2][0]
            bin_idx = self.find_bin_index(final_x)
            
            # Stack ball in bin
            final_y = self.bins_data[bin_idx]['bottom_y'] + \
                     self.bin_counts[bin_idx] * (self.ball_radius * 2.1)
            path_points[-1] = [self.bins_data[bin_idx]['x'], final_y, 0]
            
            # Update count
            self.bin_counts[bin_idx] += 1
            
            # Create path
            path = VMobject()
            path.set_points_as_corners([np.array(p) for p in path_points])
            
            # Add ball to scene and animate
            self.add(ball)
            all_balls.add(ball)
            
            # Animate with faster runtime for efficiency
            self.play(
                MoveAlongPath(ball, path),
                run_time=1.2,
                rate_func=linear
            )
            
            # Very brief pause
            if i < self.n_balls - 1 and i % 5 == 0:
                self.wait(0.05)
        
        self.wait(1)
    
    def calculate_path(self):
        """Calculate random path through pegs (Bernoulli trials)."""
        x = 0
        y = 3.8
        path = [[x, y, 0]]
        
        start_y = 2.8
        
        for row in range(self.n_rows):
            # Random left (-1) or right (+1)
            direction = random.choice([-1, 1])
            x += direction * self.peg_spacing / 2
            y = start_y - row * self.peg_spacing
            
            # Add bounce point
            path.append([x, y, 0])
        
        # Add final drop point (will be adjusted for bin stacking)
        path.append([x, -2, 0])
        
        return path
    
    def find_bin_index(self, x_position):
        """Find which bin the ball lands in."""
        closest_idx = 0
        min_dist = float('inf')
        
        for i, bin_data in enumerate(self.bins_data):
            dist = abs(x_position - bin_data['x'])
            if dist < min_dist:
                min_dist = dist
                closest_idx = i
        
        return closest_idx
    
    def highlight_pattern(self):
        """Add annotation about the emerging pattern."""
        # Draw a curve showing the normal distribution shape
        bell_curve = self.draw_distribution_overlay()
        
        self.play(Create(bell_curve), run_time=2)
        self.wait(1)
        
        # Add text annotation
        annotation = Text(
            "Random individual bounces → Predictable collective pattern",
            font="EB Garamond",
            font_size=28,
            color=BERKELEY_COLORS['california_gold']  # Bright gold
        ).to_edge(DOWN, buff=0.4)
        
        self.play(Write(annotation), run_time=1.5)
        self.wait(3)
    
    def draw_distribution_overlay(self):
        """Draw a bell curve overlay showing the distribution."""
        # Get bin heights
        max_count = max(self.bin_counts) if self.bin_counts else 1
        
        # Create points for the curve
        points = []
        for i, count in enumerate(self.bin_counts):
            x = self.bins_data[i]['x']
            # Normalize height
            height = (count / max_count) * 2.5
            y = self.bins_data[i]['bottom_y'] + height
            points.append([x, y, 0])
        
        # Create smooth curve
        curve = VMobject(color=BERKELEY_COLORS['california_gold'], stroke_width=4)
        curve.set_points_smoothly([np.array(p) for p in points])
        curve.set_stroke(opacity=0.7)
        
        return curve


class GaltonBoardQuick(Scene):
    """Quick demo version for testing (fewer balls, faster render)."""
    
    def construct(self):
        config.frame_rate = 30  # Lower FPS for testing
        
        # Copyright notice
        copyright = Text(
            "© 2024 Gautam Nayak",
            font="EB Garamond",
            font_size=18,
            color=BERKELEY_COLORS['grey'],
            weight=NORMAL
        ).to_edge(DOWN, buff=0.3)
        self.add(copyright)
        
        title = Text("Galton Board Demo", 
                    font_size=48, 
                    color=BERKELEY_COLORS['california_gold'])
        self.play(Write(title))
        self.wait(0.5)
        self.play(FadeOut(title))
        
        # Simple board
        n_rows = 8
        spacing = 0.6
        pegs = VGroup()
        
        for row in range(n_rows):
            y = 2 - row * spacing
            for col in range(row + 1):
                x = (col - row/2) * spacing
                peg = Dot([x, y, 0], radius=0.06, 
                         color=BERKELEY_COLORS['bay_fog'])
                pegs.add(peg)
        
        self.play(Create(pegs), run_time=1)
        
        # Drop 20 balls quickly
        bright_colors = [
            BERKELEY_COLORS['rose_garden'],
            BERKELEY_COLORS['california_gold'],
            BERKELEY_COLORS['golden_gate'],
            BERKELEY_COLORS['lawrence'],
        ]
        
        for i in range(20):
            ball = Dot([0, 3, 0], 
                      radius=0.08,
                      color=bright_colors[i % len(bright_colors)])
            
            x = 0
            path_pts = [[0, 3, 0]]
            for row in range(n_rows):
                x += random.choice([-1, 1]) * spacing / 2
                path_pts.append([x, 2 - row * spacing, 0])
            path_pts.append([x, -2, 0])
            
            path = VMobject().set_points_as_corners([np.array(p) for p in path_pts])
            
            self.add(ball)
            self.play(MoveAlongPath(ball, path), run_time=1, rate_func=linear)
        
        self.wait(1)
