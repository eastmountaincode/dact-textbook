from manim import *
import numpy as np

class LeastSquares(Scene):
    def construct(self):
        # Set background to black
        self.camera.background_color = BLACK
        
        # Cal colors
        CALIFORNIA_GOLD = "#FDB515"  # For residuals and SSR
        LAWRENCE = "#00B0DA"  # For line and equation (the blue part)
        SATHER_GATE = "#C4CDB5"  # RGB(195, 205, 181) - For opening title, copyright
        GOLDEN_GATE = "#EE1F60"  # For scatter points (darker)
        ROSE_GARDEN = "#F99DBB"  # Lighter shade of Golden Gate for table
        SPROUL_STEPS = "#8C8C8C"  # Not used anymore
        MEDALIST = "#C4820E"  # For square outlines (darker than Cal Gold)
        
        # Generate data
        np.random.seed(42)
        n = 12
        X = np.linspace(1, 10, n)
        true_slope = 2.3
        true_intercept = 5
        noise = np.random.normal(0, 3, n)
        Y = true_intercept + true_slope * X + noise
        
        # Calculate OLS estimators
        X_mean = np.mean(X)
        Y_mean = np.mean(Y)
        slope_ols = np.sum((X - X_mean) * (Y - Y_mean)) / np.sum((X - X_mean)**2)
        intercept_ols = Y_mean - slope_ols * X_mean
        
        # Trial parameters
        trials = [
            (2.5, 6.0),
            (2.2, 7.5),
            (2.4, 5.0),
            (2.3, 6.5),
            (slope_ols, intercept_ols)  # Optimal
        ]
        
        # Opening title - fade in at center with Sather Gate and Latin Modern Roman
        opening_title = Text("Least Squares Estimation", color=SATHER_GATE, weight=BOLD, font="Latin Modern Roman").scale(0.7)
        opening_title.move_to(ORIGIN)
        self.play(FadeIn(opening_title, run_time=2.0))
        self.wait(1.5)
        self.play(FadeOut(opening_title, run_time=1.5))
        self.wait(0.5)
        
        # Copyright (Sather Gate color)
        copyright_text = Text("© 2025 Gautam Sethi", color=SATHER_GATE, font="Latin Modern Roman").scale(0.22)
        copyright_text.to_corner(DR, buff=0.2)
        self.play(FadeIn(copyright_text, run_time=1.0))
        
        # Create data table on the right side with Golden Gate color (lighter)
        table_title = Text("Data", color=ROSE_GARDEN, font="Latin Modern Roman", weight=BOLD).scale(0.35)
        table_title.move_to([4.5, 2.5, 0])
        
        # Table headers
        header_x = Text("X", color=ROSE_GARDEN, font="Latin Modern Roman", slant=ITALIC).scale(0.3)
        header_y = Text("Y", color=ROSE_GARDEN, font="Latin Modern Roman", slant=ITALIC).scale(0.3)
        header_x.move_to([3.8, 2.0, 0])
        header_y.move_to([5.2, 2.0, 0])
        
        # Thick top line
        top_line = Line([3.2, 2.2, 0], [5.8, 2.2, 0], color=ROSE_GARDEN, stroke_width=3)
        # Medium line after header (reduced space)
        header_line = Line([3.2, 1.85, 0], [5.8, 1.85, 0], color=ROSE_GARDEN, stroke_width=2)
        # Thick bottom line
        bottom_line = Line([3.2, -1.65, 0], [5.8, -1.65, 0], color=ROSE_GARDEN, stroke_width=3)
        
        # Data rows
        data_cells = VGroup()
        row_y_start = 1.60  # Start closer to header (reduced dead space)
        row_spacing = 0.27  # Reduced from 0.30 to fit all rows
        
        for i in range(n):
            x_cell = Text(f"{X[i]:.1f}", color=ROSE_GARDEN, font="Latin Modern Roman").scale(0.3)
            y_cell = Text(f"{Y[i]:.1f}", color=ROSE_GARDEN, font="Latin Modern Roman").scale(0.3)
            
            row_y = row_y_start - i * row_spacing
            x_cell.move_to([3.8, row_y, 0])
            y_cell.move_to([5.2, row_y, 0])
            
            data_cells.add(VGroup(x_cell, y_cell))
        
        # Group all table elements
        data_table = VGroup(table_title, header_x, header_y, top_line, header_line, bottom_line, *data_cells)
        
        # Fade in the table
        self.play(FadeIn(data_table, run_time=2.0))
        self.wait(1.0)
        
        # Create axes (on the left side)
        axes = Axes(
            x_range=[0, 12, 2],
            y_range=[0, 35, 5],
            x_length=7.5,
            y_length=5,
            axis_config={"color": WHITE, "stroke_width": 2, "include_ticks": False, "tick_size": 0.05},
            tips=False,
        )
        axes.shift(LEFT * 1.8)
        
        # Axis labels manually
        x_tick_labels = VGroup(*[
            Text(str(i), color=WHITE, font="Latin Modern Roman").scale(0.25).next_to(axes.c2p(i, 0), DOWN, buff=0.15)
            for i in range(0, 13, 2)
        ])
        y_tick_labels = VGroup(*[
            Text(str(i), color=WHITE, font="Latin Modern Roman").scale(0.25).next_to(axes.c2p(0, i), LEFT, buff=0.15)
            for i in range(0, 40, 5)
        ])
        
        # Create tick marks manually
        x_ticks = VGroup(*[
            Line(axes.c2p(i, 0), axes.c2p(i, -0.2), color=WHITE, stroke_width=2)
            for i in range(0, 13, 2)
        ])
        y_ticks = VGroup(*[
            Line(axes.c2p(0, i), axes.c2p(-0.2, i), color=WHITE, stroke_width=2)
            for i in range(0, 40, 5)
        ])
        
        # X label below the X-axis
        x_label = Text("X", color=WHITE, slant=ITALIC, font="Latin Modern Roman").scale(0.5).next_to(axes.x_axis, DOWN, buff=0.4)
        # Y label on the side of Y-axis
        y_label = Text("Y", color=WHITE, slant=ITALIC, font="Latin Modern Roman").scale(0.5).next_to(axes.y_axis, LEFT, buff=0.4)
        
        # Draw X-axis from left to right (wipe)
        self.play(Create(axes.x_axis, run_time=2.0))
        # Draw Y-axis from bottom to top (wipe)
        self.play(Create(axes.y_axis, run_time=2.0))
        # Fade in axis labels
        self.play(
            FadeIn(x_label, run_time=1.0),
            FadeIn(y_label, run_time=1.0),
        )
        # Fade in tick marks and numbers
        self.play(
            FadeIn(x_ticks, run_time=1.0),
            FadeIn(y_ticks, run_time=1.0),
            FadeIn(x_tick_labels, run_time=1.0),
            FadeIn(y_tick_labels, run_time=1.0)
        )
        self.wait(0.5)
        
        # Animate scatter points one by one, highlighting table rows
        dots = VGroup()
        for i in range(n):
            # Border around the row in Rose Garden (no fill)
            row_highlight = Rectangle(
                width=2.6,
                height=0.26,  # Adjusted for new row spacing
                stroke_color=ROSE_GARDEN,
                stroke_width=1.0,  # Thicker border
                fill_opacity=0  # No fill
            )
            row_y = row_y_start - i * row_spacing
            row_highlight.move_to([4.5, row_y, 0])
            
            self.play(FadeIn(row_highlight, run_time=0.3))
            
            # Create and show the dot
            dot = Dot(axes.c2p(X[i], Y[i]), color=GOLDEN_GATE, radius=0.04)
            dots.add(dot)
            self.play(GrowFromCenter(dot, run_time=1.0))
            
            self.play(FadeOut(row_highlight, run_time=0.2))
        
        self.wait(0.5)
        
        # Fade out the table completely
        self.play(FadeOut(data_table, run_time=1.5))
        self.wait(1.0)
        
        # Table setup for regression results - fixed positions
        table_x_base = 4.5
        table_y_base = 0.5
        column_width = 1.2
        
        # Column x-positions
        col1_x = table_x_base - column_width
        col2_x = table_x_base
        col3_x = table_x_base + column_width
        
        # Table header for first two columns only (initially) - LAWRENCE (blue)
        header1 = Text("Intercept", color=LAWRENCE, font="Latin Modern Roman").scale(0.3).move_to([col1_x, table_y_base, 0])
        header2 = Text("Slope", color=LAWRENCE, font="Latin Modern Roman").scale(0.3).move_to([col2_x, table_y_base, 0])
        
        header_line_partial = Line(
            [col1_x - 0.5, table_y_base - 0.2, 0],
            [col2_x + 0.5, table_y_base - 0.2, 0],
            color=WHITE,
            stroke_width=2
        )
        
        table_header_partial = VGroup(header1, header2, header_line_partial)
        
        # SSR header (to be added later) - CALIFORNIA_GOLD
        header3 = Text("SSR", color=CALIFORNIA_GOLD, font="Latin Modern Roman").scale(0.3).move_to([col3_x, table_y_base, 0])
        
        # Create line function (LAWRENCE - blue)
        def create_line(slope, intercept):
            x_start, x_end = 0, 12
            y_start = intercept + slope * x_start
            y_end = intercept + slope * x_end
            return Line(axes.c2p(x_start, y_start), axes.c2p(x_end, y_end), color=LAWRENCE, stroke_width=3)
        
        # Create residuals function (CALIFORNIA_GOLD with MEDALIST outlines)
        def create_residuals(slope, intercept):
            solid_lines = VGroup()
            squares = VGroup()
            ssr = 0
            
            for i in range(n):
                y_pred = intercept + slope * X[i]
                residual = Y[i] - y_pred
                ssr += residual**2
                
                point_on_data = axes.c2p(X[i], Y[i])
                point_on_line = axes.c2p(X[i], y_pred)
                
                # Solid CALIFORNIA_GOLD line
                solid_line = Line(point_on_data, point_on_line, color=CALIFORNIA_GOLD, stroke_width=2)
                solid_lines.add(solid_line)
                
                side_length = abs(axes.c2p(0, residual)[1] - axes.c2p(0, 0)[1])
                
                if residual > 0:
                    corner1, corner2 = point_on_line, point_on_data
                    corner3 = point_on_data + LEFT * side_length
                    corner4 = point_on_line + LEFT * side_length
                else:
                    corner1, corner2 = point_on_line, point_on_data
                    corner3 = point_on_data + RIGHT * side_length
                    corner4 = point_on_line + RIGHT * side_length
                
                # CALIFORNIA_GOLD squares with MEDALIST (darker) outlines for better visibility
                square = Polygon(
                    corner1, corner2, corner3, corner4, 
                    stroke_width=2, 
                    stroke_color=MEDALIST,  # Darker outline
                    fill_color=CALIFORNIA_GOLD, 
                    fill_opacity=0.8  # Slightly transparent to see overlaps
                )
                squares.add(square)
            
            return solid_lines, squares, ssr
        
        # Store objects
        current_line = None
        current_equation = None
        current_title = None  # This will be the subtitle moved to title position
        ssr_header_shown = False
        
        # Iterate through trials
        for trial_num, (slope, intercept) in enumerate(trials):
            is_optimal = (trial_num == len(trials) - 1)
            
            # Calculate row y-position
            row_y = table_y_base - 0.6 - (trial_num * 0.35)
            
            # Create table cells for this row (first two columns in LAWRENCE)
            cell1 = Text(f"{intercept:.1f}", color=LAWRENCE, font="Latin Modern Roman").scale(0.3).move_to([col1_x, row_y, 0])
            cell2 = Text(f"{slope:.2f}", color=LAWRENCE, font="Latin Modern Roman").scale(0.3).move_to([col2_x, row_y, 0])
            
            # Show table header on first iteration, then just the cells
            if trial_num == 0:
                self.play(
                    FadeIn(table_header_partial, run_time=1.0),
                    FadeIn(cell1, run_time=0.8),
                    FadeIn(cell2, run_time=0.8)
                )
            else:
                self.play(FadeIn(cell1, run_time=0.8), FadeIn(cell2, run_time=0.8))
            
            self.wait(0.5)
            
            # Create line AFTER table cells (always wipe in new line)
            current_line = create_line(slope, intercept)
            self.play(Create(current_line, run_time=2.0))
            
            # Create equation next to line (LAWRENCE with italicized variables) - smaller size
            current_equation = MarkupText(
                f"<i>Ŷ</i> = {intercept:.1f} + {slope:.2f}<i>X</i>",
                color=LAWRENCE,
                font="Latin Modern Roman"
            ).scale(0.3)
            line_end_y = intercept + slope * 12
            line_end_point = axes.c2p(12, line_end_y)
            current_equation.next_to(line_end_point, RIGHT, buff=0.2)
            self.play(FadeIn(current_equation, run_time=0.8))
            
            self.wait(0.5)
            
            # Create residuals
            solid_lines, squares, ssr = create_residuals(slope, intercept)
            
            # Step 1: Show "Residuals" title (CALIFORNIA_GOLD) at top and animate residual lines
            title1 = Text("Residuals", color=CALIFORNIA_GOLD, font="Latin Modern Roman").scale(0.4)
            title1.to_edge(UP, buff=0.3)
            
            if trial_num == 0:
                current_title = title1
                self.play(FadeIn(current_title, run_time=0.8))
            else:
                self.play(Transform(current_title, title1), run_time=0.8)
            
            self.play(LaggedStart(*[Create(sl) for sl in solid_lines], lag_ratio=0.12, run_time=2.0))
            self.wait(0.5)
            
            # Step 2: Transition to "Squared residuals" (CALIFORNIA_GOLD) and show squares
            title2 = Text("Squared residuals", color=CALIFORNIA_GOLD, font="Latin Modern Roman").scale(0.4)
            title2.to_edge(UP, buff=0.3)
            
            self.play(Transform(current_title, title2), run_time=0.8)
            self.play(LaggedStart(*[DrawBorderThenFill(sq) for sq in squares], lag_ratio=0.15, run_time=3.0))
            self.wait(0.8)
            
            # Step 3: Add SSR column header (first time only), show SSR value, and transition title
            if not ssr_header_shown:
                # Extend the header line to include third column
                header_line_full = Line(
                    [col1_x - 0.5, table_y_base - 0.2, 0],
                    [col3_x + 0.5, table_y_base - 0.2, 0],
                    color=WHITE,
                    stroke_width=2
                )
                self.play(
                    Transform(header_line_partial, header_line_full),
                    FadeIn(header3, run_time=1.0)
                )
                ssr_header_shown = True
            
            # Create SSR value cell (CALIFORNIA_GOLD)
            cell3 = Text(f"{ssr:.1f}", color=CALIFORNIA_GOLD, font="Latin Modern Roman").scale(0.3).move_to([col3_x, row_y, 0])
            
            # Transition title to full text with SSR value (CALIFORNIA_GOLD)
            title3 = Text(f"Sum of squared residuals (SSR) = {ssr:.1f}", color=CALIFORNIA_GOLD, font="Latin Modern Roman").scale(0.4)
            title3.to_edge(UP, buff=0.3)
            
            self.play(
                Transform(current_title, title3),
                FadeIn(cell3, run_time=0.8)
            )
            
            self.wait(2.0)
            
            # Fade out residuals, title, line and equation before next iteration (except on last one)
            if not is_optimal:
                self.play(
                    FadeOut(solid_lines, run_time=1.0), 
                    FadeOut(squares, run_time=1.0),
                    FadeOut(current_title, run_time=1.0),
                    FadeOut(current_line, run_time=1.0),
                    FadeOut(current_equation, run_time=1.0)
                )
                self.wait(0.8)
            else:
                # On the last one, fade out title, residuals, and then equation
                self.wait(1.0)
                self.play(
                    FadeOut(current_title, run_time=2.0),
                    FadeOut(solid_lines, run_time=1.0),
                    FadeOut(squares, run_time=1.0)
                )
                self.wait(1.0)
                
                # Fade out the equation
                #self.play(FadeOut(current_equation, run_time=1.5))
                #self.wait(0.5)
                
                # Create final title with the regression equation
                final_title = MarkupText(
                    f"Least squares regression line",
                    color=LAWRENCE,
                    font="Latin Modern Roman"
                ).scale(0.4)
                final_title.to_edge(UP, buff=0.3)
                
                self.play(FadeIn(final_title, run_time=2.0))
                self.wait(3)
        
        self.wait(3)

if __name__ == "__main__":
    from manim import config
    config.pixel_height = 1080
    config.pixel_width = 1920
    config.frame_height = 8.0
    config.frame_width = 14.0
    config.frame_rate = 30
    config.output_file = "LeastSquares.mp4"