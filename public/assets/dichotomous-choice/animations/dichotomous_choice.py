from manim import *
import numpy as np
from scipy import stats
from scipy.optimize import fsolve

# Configure output - saves directly to current directory
config.frame_width = 16
config.frame_height = 9
config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 60
config.output_file = "dichotomous_choice.mp4"
config.media_dir = "."  # Current directory
config.video_dir = "."  # No subdirectories

# Berkeley colors - exact from LeastSquares.py
CALIFORNIA_GOLD = "#F9B722"  # RGB(249, 183, 34) - more red, less blue
LAWRENCE = "#00B0DA"
SATHER_GATE = "#C4CDB5"  # For copyright

class DichotomousChoice(Scene):
    def construct(self):
        self.camera.background_color = BLACK
        
        # Title - using Latin Modern Roman BOLD like LeastSquares
        title = Text("Derivation of dichotomous choice model", font="Latin Modern Roman", weight=BOLD, color=WHITE).scale(0.7)
        self.play(FadeIn(title))
        self.wait(1)
        self.play(FadeOut(title))
        self.wait(0.5)
        
        # Copyright - scale(0.22) like LeastSquares
        copyright_text = Text("© 2025 Gautam Sethi", font="Latin Modern Roman", color=SATHER_GATE).scale(0.22)
        copyright_text.to_corner(DR, buff=0.2)
        self.play(FadeIn(copyright_text, run_time=1.0))
        
        # Create four panel positions - 0.5 unit margins, 1 unit spacing between panels
        panel_width = 3.0
        panel_spacing = 1.0
        margin = 0.5
        # Positions: margin + half_width, then add (width + spacing) for each subsequent panel
        panel_positions = [
            -8 + margin + panel_width/2,  # First panel
            -8 + margin + panel_width/2 + (panel_width + panel_spacing),  # Second panel
            -8 + margin + panel_width/2 + 2*(panel_width + panel_spacing),  # Third panel
            -8 + margin + panel_width/2 + 3*(panel_width + panel_spacing)   # Fourth panel
        ]
        
        # Common Y position for all axes - moved up by 0.5, then by 0.3 more
        common_y_position = -1.2
        
        # PANEL 1: Bar chart for Y
        panel1 = VGroup()
        
        # X-axis for panel 1
        x_axis1 = Line(
            start=[-panel_width/2, common_y_position, 0],
            end=[panel_width/2, common_y_position, 0],
            color=WHITE,
            stroke_width=2
        )
        
        # Y label - establish common baseline position
        y_label = Text("Y", font="Latin Modern Roman", slant=ITALIC, color=WHITE).scale(0.5)
        # Use absolute positioning for baseline
        baseline_y = common_y_position - 0.6
        y_label.move_to([x_axis1.get_center()[0], baseline_y, 0])
        
        # Bars - 20% for Y=0, 80% for Y=1
        bar_width = 1.0
        bar_0_height = 0.5
        bar_1_height = 2.0
        
        bar_0 = Rectangle(
            width=bar_width,
            height=bar_0_height,
            fill_color=LAWRENCE,
            fill_opacity=1,
            stroke_color=WHITE,
            stroke_width=2
        )
        bar_0.move_to([-0.8, common_y_position + bar_0_height/2, 0])
        
        bar_1 = Rectangle(
            width=bar_width,
            height=bar_1_height,
            fill_color=CALIFORNIA_GOLD,
            fill_opacity=1,
            stroke_color=WHITE,
            stroke_width=2
        )
        bar_1.move_to([0.8, common_y_position + bar_1_height/2, 0])
        
        # Labels for bars
        label_0 = Text("0", font="Latin Modern Roman", color=WHITE).scale(0.3)
        label_0.next_to(bar_0, DOWN, buff=0.15)
        
        label_1 = Text("1", font="Latin Modern Roman", color=WHITE).scale(0.3)
        label_1.next_to(bar_1, DOWN, buff=0.15)
        
        panel1.add(x_axis1, y_label, bar_0, bar_1, label_0, label_1)
        panel1.shift([panel_positions[0], 0.5, 0])
        
        # Panel 1 title - VGroup with center-aligned lines
        title_line1 = Text("Probability distribution of", font="Latin Modern Roman", color=WHITE).scale(0.4)
        title_line2 = Text("observed choice", font="Latin Modern Roman", color=WHITE).scale(0.4)
        panel1_title = VGroup(title_line1, title_line2).arrange(DOWN, center=True, buff=0.1)
        panel1_title.move_to([panel_positions[0], 3.8, 0])
        
        self.play(FadeIn(panel1_title))
        self.play(FadeIn(panel1))
        self.wait(1)
        
        # Add P(Y = 1) equation below panel 1 - fade in after 1 second delay
        py1_label = MathTex(r"P(Y = 1)", color=CALIFORNIA_GOLD).scale(0.5)
        py1_label.move_to([panel_positions[0], -2.0, 0])
        self.play(FadeIn(py1_label))
        self.wait(2)
        
        # Add cases equation for Y below panel 1 (white) - fade in 2 seconds after panel
        panel1_eq = MathTex(
            r"Y = \begin{cases} 1 & \text{if } \widetilde{Y} > 0 \\ 0 & \text{if } \widetilde{Y} \leq 0 \end{cases}",
            color=WHITE
        ).scale(0.5)
        panel1_eq.move_to([panel_positions[0], -3.0, 0])
        self.play(FadeIn(panel1_eq))
        self.wait(1)
        
        # PANEL 2: Gamma distribution for Ỹ
        panel2 = VGroup()
        
        # Find gamma parameters such that P(Ỹ < 0) = 0.35
        def find_gamma_params():
            a = 2.0  # shape parameter
            scale = 1.8  # increased scale to spread it out more
            
            def objective(loc):
                return stats.gamma.cdf(0, a, loc=loc, scale=scale) - 0.20
            
            # Shift significantly left to use the left space
            loc = fsolve(objective, -4.0)[0]
            return a, loc, scale
        
        a_param, loc_param, scale_param = find_gamma_params()
        
        # Create axes for panel 2 - using -1.5 to 13.5 range, NO STEP parameter, NO Y-AXIS
        ax2 = Axes(
            x_range=[-1.5, 13.5],
            y_range=[0, 0.3],
            x_length=panel_width,
            y_length=3,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": False, "include_ticks": False, "stroke_width": 2},
            tips=False,
            x_axis_config={"include_ticks": False},
            y_axis_config={"stroke_opacity": 0}  # Hide y-axis
        ).shift([0, common_y_position + 1.5, 0])
        
        # Gamma curve - matching the axis range exactly
        x_vals = np.linspace(-1.5, 13.5, 500)
        y_vals = stats.gamma.pdf(x_vals, a_param, loc=loc_param, scale=scale_param)
        
        gamma_curve = ax2.plot_line_graph(
            x_vals, y_vals, add_vertex_dots=False, line_color=WHITE, stroke_width=3
        )
        
        # Shaded areas - NO STROKE on polygons
        x_left = x_vals[x_vals <= 0]
        y_left = stats.gamma.pdf(x_left, a_param, loc=loc_param, scale=scale_param)
        
        left_points = [ax2.c2p(x, 0) for x in [x_left[0]]] + \
                     [ax2.c2p(x, y) for x, y in zip(x_left, y_left)] + \
                     [ax2.c2p(0, 0)]
        area_left = Polygon(*left_points, fill_color=LAWRENCE, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        x_right = x_vals[x_vals >= 0]
        y_right = stats.gamma.pdf(x_right, a_param, loc=loc_param, scale=scale_param)
        
        right_points = [ax2.c2p(0, 0)] + \
                      [ax2.c2p(x, y) for x, y in zip(x_right, y_right)] + \
                      [ax2.c2p(x_right[-1], 0)]
        area_right = Polygon(*right_points, fill_color=CALIFORNIA_GOLD, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        # Mark 0 - scale(0.3)
        zero_label = Text("0", font="Latin Modern Roman", color=WHITE).scale(0.3)
        zero_label.next_to(ax2.c2p(0, 0), DOWN, buff=0.15)
        
        # Y-tilde label - scale(0.5), consistent position
        # Ỹ label - build as Y + tilde decoration to match panel 1's Y exactly
        # Position Y base at same baseline as panel 1
        y_base_panel2 = Text("Y", font="Latin Modern Roman", slant=ITALIC, color=WHITE).scale(0.5)
        y_base_panel2.move_to([ax2.get_center()[0], baseline_y, 0])
        
        # Tilde decoration increased 30%: 0.5 * 1.3 = 0.65
        tilde_decoration = MathTex(r"\tilde{\phantom{Y}}", color=WHITE).scale(0.65)
        tilde_decoration.move_to(y_base_panel2.get_top() + UP * 0.1)
        
        y_tilde_label = VGroup(y_base_panel2, tilde_decoration)
        
        panel2.add(ax2, gamma_curve, area_left, area_right, zero_label, y_tilde_label)
        panel2.shift([panel_positions[1], 0.5, 0])
        
        # Panel 2 title - VGroup with center-aligned lines
        title2_line1 = Text("Probability distribution of", font="Latin Modern Roman", color=WHITE).scale(0.4)
        title2_line2 = Text("latent variable", font="Latin Modern Roman", color=WHITE).scale(0.4)
        panel2_title = VGroup(title2_line1, title2_line2).arrange(DOWN, center=True, buff=0.1)
        panel2_title.move_to([panel_positions[1], 3.8, 0])
        
        # Add P(Ỹ > 0) equation below panel 2 in CALIFORNIA_GOLD
        pyhat_label = MathTex(r"P(\widetilde{Y} > 0)", color=CALIFORNIA_GOLD).scale(0.5)
        pyhat_label.move_to([panel_positions[1], -2.0, 0])
        
        self.wait(0.5)
        self.play(FadeIn(panel2_title))
        self.wait(1)
        self.play(FadeIn(panel2), FadeIn(pyhat_label))
        self.wait(2)
        
        # Add two equations below panel 2 (white) - fade in 2 seconds after panel
        panel2_eq1 = MathTex(r"\widetilde{Y} > 0 \text{ if } \varepsilon > -\widehat{Y}", color=WHITE).scale(0.5)
        panel2_eq2 = MathTex(r"\widehat{Y} = \beta_0 + \beta_1 X", color=WHITE).scale(0.5)
        panel2_eqs = VGroup(panel2_eq1, panel2_eq2).arrange(DOWN, center=True, buff=0.15)
        panel2_eqs.move_to([panel_positions[1], -3.0, 0])
        self.play(FadeIn(panel2_eqs))
        self.wait(1)
        
        # PANEL 3: Distribution for ε with -Ŷ marked
        panel3 = VGroup()
        
        # Calculate yhat_position here since we need it for the distribution shift
        zero_position = stats.norm.ppf(0.20)
        yhat_position = -zero_position  # approximately 0.842
        
        # Shift the gamma distribution LEFT by yhat_position for epsilon (ε = Ỹ - Ŷ)
        loc_param_panel3 = loc_param - yhat_position
        
        ax3 = Axes(
            x_range=[-2.342, 12.658],
            y_range=[0, 0.3],
            x_length=panel_width,
            y_length=3,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": False, "include_ticks": False, "stroke_width": 2},
            tips=False,
            x_axis_config={"include_ticks": False},
            y_axis_config={"stroke_opacity": 0}  # Hide y-axis
        ).shift([0, common_y_position + 1.5, 0])
        
        # Same gamma curve but with shifted loc parameter and new x range
        x_vals_panel3 = np.linspace(-2.342, 12.658, 500)
        y_vals_panel3 = stats.gamma.pdf(x_vals_panel3, a_param, loc=loc_param_panel3, scale=scale_param)
        
        gamma_curve3 = ax3.plot_line_graph(
            x_vals_panel3, y_vals_panel3, add_vertex_dots=False, line_color=WHITE, stroke_width=3
        )
        
        # Shaded areas - recalculate with new x range and shifted distribution
        # Split at -Ŷ (which is at x = -yhat_position), NOT at 0
        split_point = -yhat_position
        
        x_left_panel3 = x_vals_panel3[x_vals_panel3 <= split_point]
        y_left_panel3 = stats.gamma.pdf(x_left_panel3, a_param, loc=loc_param_panel3, scale=scale_param)
        
        left_points3 = [ax3.c2p(x, 0) for x in [x_left_panel3[0]]] + \
                      [ax3.c2p(x, y) for x, y in zip(x_left_panel3, y_left_panel3)] + \
                      [ax3.c2p(split_point, 0)]
        area_left3 = Polygon(*left_points3, fill_color=LAWRENCE, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        x_right_panel3 = x_vals_panel3[x_vals_panel3 >= split_point]
        y_right_panel3 = stats.gamma.pdf(x_right_panel3, a_param, loc=loc_param_panel3, scale=scale_param)
        
        right_points3 = [ax3.c2p(split_point, 0)] + \
                       [ax3.c2p(x, y) for x, y in zip(x_right_panel3, y_right_panel3)] + \
                       [ax3.c2p(x_right_panel3[-1], 0)]
        area_right3 = Polygon(*right_points3, fill_color=CALIFORNIA_GOLD, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        # Mark -Ŷ at the split point (-yhat_position) - build as minus + Y + hat to match post-morph
        y_part_pre = Text("Y", font="Latin Modern Roman", slant=ITALIC, color=WHITE).scale(0.3)
        minus_part_pre = Text("-", font="Latin Modern Roman", color=WHITE).scale(0.3)
        
        # Position minus and Y together first
        minus_y_pre = VGroup(minus_part_pre, y_part_pre).arrange(RIGHT, buff=0.05)
        minus_y_pre.next_to(ax3.c2p(-yhat_position, 0), DOWN, buff=0.1)
        
        # Add hat on top of the Y part
        hat_part_pre = MathTex(r"\hat{\phantom{Y}}", color=WHITE).scale(0.6)
        hat_part_pre.move_to(y_part_pre.get_top() + UP * 0.05)
        
        neg_yhat_label = VGroup(minus_y_pre, hat_part_pre)
        
        # ε label - consistent position
        # ε label - increased 30%: 0.5 * 1.3 = 0.65, positioned at baseline
        epsilon_label = MathTex(r"\varepsilon", color=WHITE).scale(0.65)
        epsilon_label.move_to([ax3.get_center()[0], baseline_y, 0])
        
        panel3.add(ax3, gamma_curve3, area_left3, area_right3, neg_yhat_label, epsilon_label)
        panel3.shift([panel_positions[2], 0.5, 0])
        
        # Panel 3 title - VGroup with center-aligned lines
        title3_line1 = Text("Probability distribution of", font="Latin Modern Roman", color=WHITE).scale(0.4)
        title3_line2 = Text("error term", font="Latin Modern Roman", color=WHITE).scale(0.4)
        panel3_title = VGroup(title3_line1, title3_line2).arrange(DOWN, center=True, buff=0.1)
        panel3_title.move_to([panel_positions[2], 3.8, 0])
        
        # Assumption text at top of panel 3 (where equations were) - VGroup with center-aligned lines, scale(0.3)
        assumption_line1 = Text("Assuming the error term", font="Latin Modern Roman", color=WHITE).scale(0.3)
        assumption_line2 = Text("has mean 0 and is symmetric", font="Latin Modern Roman", color=WHITE).scale(0.3)
        assumption_text = VGroup(assumption_line1, assumption_line2).arrange(DOWN, center=True, buff=0.05)
        assumption_text.move_to([panel_positions[2], 2.6, 0])
        
        # Add P(ε > -(β₀ + β₁X)) equation below panel 3 in CALIFORNIA_GOLD
        pepsilon_label = MathTex(r"P(\varepsilon > -(\beta_0 + \beta_1 X))", color=CALIFORNIA_GOLD).scale(0.5)
        pepsilon_label.move_to([panel_positions[2], -2.5, 0])
        
        # Add second equation P(ε > -Ŷ) below the first one
        pepsilon_yhat_label = MathTex(r"P(\varepsilon > -\widehat{Y})", color=CALIFORNIA_GOLD).scale(0.5)
        pepsilon_yhat_label.move_to([panel_positions[2], -2.0, 0])
        
        self.wait(0.5)
        self.play(FadeIn(panel3_title))
        self.wait(1)
        self.play(FadeIn(panel3), FadeIn(pepsilon_yhat_label), FadeIn(pepsilon_label))
        self.wait(1)
        self.play(FadeIn(assumption_text))
        self.wait(1)
        self.wait(0.5)
        
        # zero_position and yhat_position already calculated in panel 3 section
        
        # Morph to normal distribution - create NEW axes with [-3, 3] at SAME positions
        
        # Calculate the CURRENT absolute positions of ax2 and ax3 after all shifts
        # ax2: initially at [0, common_y_position + 1.5, 0], then panel2 shifted by [panel_positions[1], 0.5, 0]
        # Final position: [panel_positions[1], common_y_position + 2.0, 0]
        ax2_position = [panel_positions[1], common_y_position + 2.0, 0]
        ax3_position = [panel_positions[2], common_y_position + 2.0, 0]
        
        # Create new axes with [-3, 3] range at the SAME positions
        ax2_normal = Axes(
            x_range=[-3, 3],
            y_range=[0, 0.5],
            x_length=panel_width,
            y_length=3,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": False, "include_ticks": False, "stroke_width": 2},
            tips=False,
            x_axis_config={"include_ticks": False},
            y_axis_config={"stroke_opacity": 0}
        ).move_to(ax2_position)
        
        ax3_normal = Axes(
            x_range=[-3, 3],
            y_range=[0, 0.5],
            x_length=panel_width,
            y_length=3,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": False, "include_ticks": False, "stroke_width": 2},
            tips=False,
            x_axis_config={"include_ticks": False},
            y_axis_config={"stroke_opacity": 0}
        ).move_to(ax3_position)
        
        # Calculate normal distributions with [-3, 3] range
        x_vals_normal = np.linspace(-3, 3, 500)
        normal_y_vals = stats.norm.pdf(x_vals_normal, loc=0, scale=1)
        
        # Plot normal curves on the NEW axes
        normal_curve2 = ax2_normal.plot_line_graph(
            x_vals_normal, normal_y_vals, add_vertex_dots=False, line_color=WHITE, stroke_width=3
        )
        
        normal_curve3 = ax3_normal.plot_line_graph(
            x_vals_normal, normal_y_vals, add_vertex_dots=False, line_color=WHITE, stroke_width=3
        )
        
        # New shaded areas for panel 2 (normal) - NO STROKE AT ALL
        x_left_norm2 = x_vals_normal[x_vals_normal <= zero_position]
        y_left_norm2 = stats.norm.pdf(x_left_norm2, loc=0, scale=1)
        
        left_points_norm2 = [ax2_normal.c2p(x, 0) for x in [x_left_norm2[0]]] + \
                           [ax2_normal.c2p(x, y) for x, y in zip(x_left_norm2, y_left_norm2)] + \
                           [ax2_normal.c2p(zero_position, 0)]
        area_left_norm2 = Polygon(*left_points_norm2, fill_color=LAWRENCE, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        x_right_norm2 = x_vals_normal[x_vals_normal >= zero_position]
        y_right_norm2 = stats.norm.pdf(x_right_norm2, loc=0, scale=1)
        
        right_points_norm2 = [ax2_normal.c2p(zero_position, 0)] + \
                            [ax2_normal.c2p(x, y) for x, y in zip(x_right_norm2, y_right_norm2)] + \
                            [ax2_normal.c2p(x_right_norm2[-1], 0)]
        area_right_norm2 = Polygon(*right_points_norm2, fill_color=CALIFORNIA_GOLD, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        # New shaded areas for panel 3 (normal) - using same x range
        x_left_norm3 = x_vals_normal[x_vals_normal <= zero_position]
        y_left_norm3 = stats.norm.pdf(x_left_norm3, loc=0, scale=1)
        
        left_points_norm3 = [ax3_normal.c2p(x, 0) for x in [x_left_norm3[0]]] + \
                           [ax3_normal.c2p(x, y) for x, y in zip(x_left_norm3, y_left_norm3)] + \
                           [ax3_normal.c2p(zero_position, 0)]
        area_left_norm3 = Polygon(*left_points_norm3, fill_color=LAWRENCE, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        x_right_norm3 = x_vals_normal[x_vals_normal >= zero_position]
        y_right_norm3 = stats.norm.pdf(x_right_norm3, loc=0, scale=1)
        
        right_points_norm3 = [ax3_normal.c2p(zero_position, 0)] + \
                            [ax3_normal.c2p(x, y) for x, y in zip(x_right_norm3, y_right_norm3)] + \
                            [ax3_normal.c2p(x_right_norm3[-1], 0)]
        area_right_norm3 = Polygon(*right_points_norm3, fill_color=CALIFORNIA_GOLD, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        # Create new -Ŷ label at the transformed position - build as minus + Y + hat
        # Position the Y base first for correct baseline alignment
        y_part = Text("Y", font="Latin Modern Roman", slant=ITALIC, color=WHITE).scale(0.3)
        minus_part = Text("-", font="Latin Modern Roman", color=WHITE).scale(0.3)
        
        # Position minus and Y together first
        minus_y = VGroup(minus_part, y_part).arrange(RIGHT, buff=0.05)
        minus_y.next_to(ax3_normal.c2p(zero_position, 0), DOWN, buff=0.15)
        
        # Now add hat on top of the Y part
        hat_part = MathTex(r"\hat{\phantom{Y}}", color=WHITE).scale(0.6)
        hat_part.move_to(y_part.get_top() + UP * 0.05)
        
        new_neg_yhat = VGroup(minus_y, hat_part)
        
        # New zero label for panel 2
        new_zero_label2 = Text("0", font="Latin Modern Roman", color=WHITE).scale(0.3)
        new_zero_label2.next_to(ax2_normal.c2p(zero_position, 0), DOWN, buff=0.15)
        
        # Morph everything INCLUDING -Ŷ label
        self.play(
            Transform(gamma_curve, normal_curve2),
            Transform(gamma_curve3, normal_curve3),
            Transform(area_left, area_left_norm2),
            Transform(area_right, area_right_norm2),
            Transform(area_left3, area_left_norm3),
            Transform(area_right3, area_right_norm3),
            Transform(zero_label, new_zero_label2),
            Transform(neg_yhat_label, new_neg_yhat),
            run_time=2
        )
        self.wait(0.5)
        
        # NOW add 0 marker in panel 3 AFTER morphing - at x=0, not yhat_position
        zero_label3 = Text("0", font="Latin Modern Roman", color=WHITE).scale(0.3)
        zero_label3.next_to(ax3_normal.c2p(0, 0), DOWN, buff=0.15)
        
        self.play(FadeIn(zero_label3))
        self.wait(1)
        
        # PANEL 4: Same as panel 3 but with swapped colors
        panel4 = VGroup()
        
        ax4 = Axes(
            x_range=[-3, 3],
            y_range=[0, 0.5],
            x_length=panel_width,
            y_length=3,
            axis_config={"color": WHITE, "include_tip": False, "include_numbers": False, "include_ticks": False, "stroke_width": 2},
            tips=False,
            x_axis_config={"include_ticks": False},
            y_axis_config={"stroke_opacity": 0}  # Hide y-axis
        ).shift([0, common_y_position + 1.5, 0])
        
        # Normal curve - use [-3, 3] range
        x_vals_panel4 = np.linspace(-3, 3, 500)
        normal_y_vals_panel4 = stats.norm.pdf(x_vals_panel4, loc=0, scale=1)
        
        normal_curve4 = ax4.plot_line_graph(
            x_vals_panel4, normal_y_vals_panel4, add_vertex_dots=False, line_color=WHITE, stroke_width=3
        )
        
        # Swapped colors - NO STROKE AT ALL
        x_left_swap = x_vals_panel4[x_vals_panel4 <= yhat_position]
        y_left_swap = stats.norm.pdf(x_left_swap, loc=0, scale=1)
        
        left_points_swap = [ax4.c2p(x, 0) for x in [x_left_swap[0]]] + \
                          [ax4.c2p(x, y) for x, y in zip(x_left_swap, y_left_swap)] + \
                          [ax4.c2p(yhat_position, 0)]
        area_left_swap = Polygon(*left_points_swap, fill_color=CALIFORNIA_GOLD, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        x_right_swap = x_vals_panel4[x_vals_panel4 >= yhat_position]
        y_right_swap = stats.norm.pdf(x_right_swap, loc=0, scale=1)
        
        right_points_swap = [ax4.c2p(yhat_position, 0)] + \
                           [ax4.c2p(x, y) for x, y in zip(x_right_swap, y_right_swap)] + \
                           [ax4.c2p(x_right_swap[-1], 0)]
        area_right_swap = Polygon(*right_points_swap, fill_color=LAWRENCE, fill_opacity=1, stroke_width=0, stroke_opacity=0)
        
        # Build Ŷ as Y + hat decoration - position Y base first for correct alignment
        y_base = Text("Y", font="Latin Modern Roman", slant=ITALIC, color=WHITE).scale(0.3)
        y_base.next_to(ax4.c2p(yhat_position, 0), DOWN, buff=0.15)
        
        y_hat_decoration = MathTex(r"\hat{\phantom{Y}}", color=WHITE).scale(0.6)
        y_hat_decoration.move_to(y_base.get_top() + UP * 0.05)
        
        yhat_label = VGroup(y_base, y_hat_decoration)
        
        # Mark 0 - same size and positioning as other 0 labels
        zero_label4 = Text("0", font="Latin Modern Roman", color=WHITE).scale(0.3)
        zero_label4.next_to(ax4.c2p(0, 0), DOWN, buff=0.15)
        
        # ε label - increased 30%: 0.5 * 1.3 = 0.65, positioned at baseline
        epsilon_label4 = MathTex(r"\varepsilon", color=WHITE).scale(0.65)
        epsilon_label4.move_to([ax4.get_center()[0], baseline_y, 0])
        
        panel4.add(ax4, normal_curve4, area_left_swap, area_right_swap, yhat_label, zero_label4, epsilon_label4)
        panel4.shift([panel_positions[3], 0.5, 0])
        
        # Panel 4 title - VGroup with center-aligned lines
        title4_line1 = Text("Probability distribution of", font="Latin Modern Roman", color=WHITE).scale(0.4)
        title4_line2 = Text("error term", font="Latin Modern Roman", color=WHITE).scale(0.4)
        panel4_title = VGroup(title4_line1, title4_line2).arrange(DOWN, center=True, buff=0.1)
        panel4_title.move_to([panel_positions[3], 3.8, 0])
        
        self.wait(0.5)
        self.play(FadeIn(panel4_title))
        
        # Add P(ε < β₀ + β₁X) equation at y=-2.7 below panel 4
        f_epsilon_label = MathTex(r"P(\varepsilon < \beta_0 + \beta_1 X)", color=CALIFORNIA_GOLD).scale(0.5)
        f_epsilon_label.move_to([panel_positions[3], -2.0, 0])
        
        # Add F(β₀ + β₁X) equation at y=-3.2 (same as panel 3's second equation)
        f_label = MathTex(r"F(\beta_0 + \beta_1 X)", color=CALIFORNIA_GOLD).scale(0.5)
        f_label.move_to([panel_positions[3], -2.5, 0])
        
        self.play(FadeIn(panel4), FadeIn(f_epsilon_label), FadeIn(f_label))
        self.wait(1)
        
        # Add final centered equation at bottom with white border
        final_eq = MathTex(r"P(Y = 1) = F(\beta_0 + \beta_1 X)", color=CALIFORNIA_GOLD).scale(0.6)
        final_eq.move_to([0, -4.0, 0])
        
        # Add thin white rectangular border around equation
        border = Rectangle(
            width=final_eq.width + 0.3,
            height=final_eq.height + 0.2,
            stroke_color=WHITE,
            stroke_width=2,
            fill_opacity=0
        )
        border.move_to(final_eq.get_center())
        
        final_eq_group = VGroup(border, final_eq)
        
        self.play(FadeIn(final_eq_group))
        self.wait(3)