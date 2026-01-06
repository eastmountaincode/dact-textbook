"""
Galton Board Animation
=====================
Demonstrates how individual random events (Bernoulli trials) aggregate
to form a binomial distribution, which approximates the normal distribution.

Used in: Chapter 1 - The Purpose of Data Analytics

This animation shows balls dropping through pegs, bouncing left or right randomly,
and eventually forming a normal distribution pattern at the bottom.
"""

from manim import *
import numpy as np
import random

# UC Berkeley Pastel Color Palette
BERKELEY_COLORS = {
    'berkeley_blue': '#003262',      # Primary blue
    'california_gold': '#FDB515',    # Primary gold
    'light_blue': '#6C9BB4',        # Pastel blue
    'sage_green': '#B4C3A8',        # Pastel sage
    'rose': '#E89E9E',              # Pastel rose/pink
    'lavender': '#B8B3D4',          # Pastel lavender
    'peach': '#F4C095',             # Pastel peach
    'mint': '#A8D5BA',              # Pastel mint
    'soft_gold': '#F2D492',         # Soft gold
    'powder_blue': '#A8C8E1',       # Powder blue
}

# Configuration
config.pixel_height = 1080
config.pixel_width = 1920
config.frame_rate = 60
config.background_color = "#FAFAFA"  # Very light gray background

class GaltonBoardScene(Scene):
    """Main animation showing the Galton board in action."""
    
    def construct(self):
        # Parameters
        self.n_rows = 12  # Number of rows of pegs
        self.peg_spacing = 0.5
        self.ball_radius = 0.08
        self.n_balls = 200  # Total number of balls to drop
        self.bins = []
        
        # Create title
        title = Text("The Galton Board", 
                    font="EB Garamond", 
                    font_size=56,
                    color=BERKELEY_COLORS['berkeley_blue'],
                    weight=BOLD)
        title.to_edge(UP, buff=0.5)
        
        subtitle = Text("From Randomness to Pattern", 
                       font="EB Garamond", 
                       font_size=36,
                       color=BERKELEY_COLORS['sage_green'])
        subtitle.next_to(title, DOWN, buff=0.3)
        
        self.play(Write(title), run_time=1)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(1)
        
        # Fade out title for main animation
        self.play(FadeOut(title), FadeOut(subtitle), run_time=0.8)
        
        # Create the board
        board = self.create_galton_board()
        self.play(Create(board), run_time=2)
        self.wait(0.5)
        
        # Create bins at the bottom
        self.create_bins()
        
        # Drop balls
        self.drop_balls_continuously()
        
        # Final wait to show the distribution
        self.wait(2)
        
        # Add annotation about the pattern
        annotation = Text(
            "Individual randomness → Collective pattern",
            font="EB Garamond",
            font_size=32,
            color=BERKELEY_COLORS['berkeley_blue']
        )
        annotation.to_edge(DOWN, buff=0.5)
        self.play(Write(annotation), run_time=1.5)
        self.wait(2)
    
    def create_galton_board(self):
        """Create the pegs in a triangular arrangement."""
        pegs = VGroup()
        
        # Center the board
        start_y = 2.5
        
        for row in range(self.n_rows):
            y = start_y - row * self.peg_spacing
            n_pegs_in_row = row + 1
            
            # Calculate x positions to center the row
            total_width = (n_pegs_in_row - 1) * self.peg_spacing
            start_x = -total_width / 2
            
            for col in range(n_pegs_in_row):
                x = start_x + col * self.peg_spacing
                peg = Dot(point=[x, y, 0], 
                         radius=0.06,
                         color=BERKELEY_COLORS['lavender'],
                         fill_opacity=0.8)
                pegs.add(peg)
        
        return pegs
    
    def create_bins(self):
        """Create collection bins at the bottom."""
        n_bins = self.n_rows + 1
        bin_width = self.peg_spacing * 0.9
        bin_height = 2.5
        
        # Position bins at the bottom
        bottom_y = 2.5 - self.n_rows * self.peg_spacing - 0.4
        total_width = (n_bins - 1) * self.peg_spacing
        start_x = -total_width / 2
        
        for i in range(n_bins):
            x = start_x + i * self.peg_spacing
            
            # Create bin outline
            bin_outline = Rectangle(
                width=bin_width,
                height=0.1,  # Start with small height
                stroke_color=BERKELEY_COLORS['powder_blue'],
                stroke_width=2,
                fill_opacity=0
            )
            bin_outline.move_to([x, bottom_y - bin_height/2, 0])
            
            # Store bin info
            self.bins.append({
                'x': x,
                'bottom_y': bottom_y - bin_height,
                'balls': [],
                'count': 0,
                'outline': bin_outline
            })
            
            self.add(bin_outline)
    
    def drop_balls_continuously(self):
        """Drop balls one at a time with overlapping animations."""
        
        # Ball colors cycle
        ball_colors = [
            BERKELEY_COLORS['rose'],
            BERKELEY_COLORS['peach'],
            BERKELEY_COLORS['mint'],
            BERKELEY_COLORS['powder_blue'],
            BERKELEY_COLORS['soft_gold'],
            BERKELEY_COLORS['sage_green'],
        ]
        
        balls_group = VGroup()
        
        # Drop balls in batches for efficiency
        batch_size = 5
        n_batches = self.n_balls // batch_size
        
        for batch_idx in range(n_batches):
            batch_animations = []
            
            for i in range(batch_size):
                ball_idx = batch_idx * batch_size + i
                color = ball_colors[ball_idx % len(ball_colors)]
                
                # Create ball at the top
                ball = Dot(
                    point=[0, 3.5, 0],
                    radius=self.ball_radius,
                    color=color,
                    fill_opacity=0.9
                )
                balls_group.add(ball)
                
                # Calculate path
                path = self.calculate_ball_path()
                
                # Create movement animation
                animation = self.create_ball_drop_animation(ball, path)
                batch_animations.append(animation)
            
            # Play batch animations with slight delay between them
            self.play(
                *batch_animations,
                run_time=2.5,
                rate_func=linear
            )
        
        self.wait(1)
    
    def calculate_ball_path(self):
        """Calculate a random path for a ball through the pegs."""
        x = 0
        y = 3.5
        path = [[x, y, 0]]
        
        for row in range(self.n_rows):
            # Randomly go left or right (Bernoulli trial)
            direction = random.choice([-1, 1])
            x += direction * self.peg_spacing / 2
            y -= self.peg_spacing
            
            path.append([x, y, 0])
        
        # Determine which bin this ball lands in
        bin_index = self.determine_bin(x)
        
        # Add final position in the bin
        bin_info = self.bins[bin_index]
        final_y = bin_info['bottom_y'] + bin_info['count'] * (self.ball_radius * 2)
        path.append([bin_info['x'], final_y, 0])
        
        # Update bin count
        bin_info['count'] += 1
        
        return path
    
    def determine_bin(self, x_position):
        """Determine which bin a ball lands in based on its x position."""
        # Find closest bin
        min_distance = float('inf')
        closest_bin = 0
        
        for i, bin_info in enumerate(self.bins):
            distance = abs(x_position - bin_info['x'])
            if distance < min_distance:
                min_distance = distance
                closest_bin = i
        
        return closest_bin
    
    def create_ball_drop_animation(self, ball, path):
        """Create animation for a ball dropping through the path."""
        points = [np.array(p) for p in path]
        
        # Create path
        return Succession(
            FadeIn(ball, scale=0.5),
            MoveAlongPath(ball, VMobject().set_points_as_corners(points)),
            lag_ratio=0.1
        )


class GaltonBoardSimple(Scene):
    """Simplified version that's faster to render for testing."""
    
    def construct(self):
        # Similar to above but with fewer balls and simpler animations
        config.pixel_height = 1080
        config.pixel_width = 1920
        config.frame_rate = 30  # Lower framerate for faster rendering
        
        # Quick demonstration
        title = Text("Galton Board - Quick Demo", 
                    font="EB Garamond", 
                    font_size=48,
                    color=BERKELEY_COLORS['berkeley_blue'])
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))
        
        # Add board structure
        pegs = VGroup()
        n_rows = 8
        peg_spacing = 0.6
        
        for row in range(n_rows):
            y = 2 - row * peg_spacing
            for col in range(row + 1):
                x = (col - row/2) * peg_spacing
                peg = Dot([x, y, 0], radius=0.08, color=BERKELEY_COLORS['lavender'])
                pegs.add(peg)
        
        self.play(Create(pegs), run_time=1.5)
        
        # Drop a few balls to show the concept
        for _ in range(10):
            ball = Dot([0, 3, 0], 
                      radius=0.1, 
                      color=random.choice([
                          BERKELEY_COLORS['rose'],
                          BERKELEY_COLORS['mint'],
                          BERKELEY_COLORS['peach']
                      ]))
            
            # Random path
            x = 0
            path_points = [[0, 3, 0]]
            for row in range(n_rows):
                x += random.choice([-1, 1]) * peg_spacing / 2
                y = 2 - row * peg_spacing
                path_points.append([x, y, 0])
            path_points.append([x, -2.5, 0])
            
            path = VMobject().set_points_as_corners([np.array(p) for p in path_points])
            
            self.play(
                FadeIn(ball, scale=0.5),
                MoveAlongPath(ball, path),
                run_time=1.5,
                rate_func=linear
            )
        
        self.wait(2)
