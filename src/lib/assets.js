// src/lib/assets.js
// Centralized asset paths to eliminate hardcoded strings throughout the codebase
import { base } from '$app/paths';

export const ASSETS = {
	// Project-specific assets
	projects: {
		blizzard: {
			render: `${base}/assets/blizz.png`,
			iso: `${base}/assets/IsoTransparentWebsite.png`,
			carpet_plot: `${base}/assets/blizzard/carpet_plot.png`,
			impulse_response: `${base}/assets/blizzard/impulse_response.png`,
			monte_carlo: `${base}/assets/blizzard/monte-carlo.png`,
			rooftop_glb: `${base}/assets/blizzard/Rooftop.glb`
		},
		multivac: {
			process: `${base}/assets/basic-sixdof-process.png`,
			pos_plot: `${base}/assets/Blizzard_0_pos_plot.png`,
			script_diagram: `${base}/assets/script-creation-diagram.png`,
			tracking_anim: `${base}/assets/tracking_plot_anim.gif`,
			run_full_plot: `${base}/assets/run_full_plot.png`
		},
		trifecta: {
			cad: `${base}/assets/trifecta/trifecta_cad.png`,
			pos_plot: `${base}/assets/trifecta/Trifecta_0_pos_plot.png`,
			att_plot: `${base}/assets/trifecta/Trifecta_0_att_plot.png`,
			render_screenshot: `${base}/assets/trifecta/render_screenshot.png`,
			// 3D model parts
			stator_glb: `${base}/assets/trifecta/stator.glb`,
			rotor_glb: `${base}/assets/trifecta/rotor.glb`,
			top_shell_glb: `${base}/assets/trifecta/TopShell.glb`,
			bot_shell_glb: `${base}/assets/trifecta/BotShell.glb`,
			front_arm_l_glb: `${base}/assets/trifecta/FrontArmL.glb`,
			front_arm_r_glb: `${base}/assets/trifecta/FrontArmR.glb`,
			back_slide_glb: `${base}/assets/trifecta/BackSlide.glb`,
			tail_gear_glb: `${base}/assets/trifecta/TailGear.glb`,
			tail_glb: `${base}/assets/trifecta/Tail.glb`
		},
		bldc: {
			motor_pic: `${base}/assets/bldc/motor_pic.png`,
			motordiag: `${base}/assets/bldc/motordiag2.png`
		},
		grs: {
			block_diagram: `${base}/assets/BlockDiagTransparent4.png`,
			block_diagram_svg: `${base}/assets/BlockDiagStylized.svg`,
			yaw_input: `${base}/assets/grs/grs_yaw_input.png`,
			roll_response: `${base}/assets/grs/grs_roll_response.png`
		},
		clementine: {
			poster: `${base}/assets/poster_req_review.png`,
			model: `${base}/assets/clementine_model_air_and_space_museum.jpg`
		},
		datacom: {
			masada: `${base}/assets/masada_test.png`
		},
		uavsim: {
			newplot: `${base}/assets/newplot.png`
		},
		flat_plate_drag: {
			results: `${base}/assets/Prob1bResults1.png`
		},
		basins: {
			attraction: `${base}/assets/basinsofattraction.png`
		},
		supersonic: {
			results: `${base}/assets/Prob2bResults.png`
		},
		aerobrick: {
			mozzie: `${base}/assets/mozziepic.png`
		},
		launchsim: {
			undeformed: `${base}/assets/Undeformed.png`
		},
		waveprop: {
			prob1b: `${base}/assets/Prob1b.png`
		}
	},

	// Photography images
	photography: {
		cooks_bay: `${base}/assets/photography/cooks_bay_2_web.jpg`,
		cooks_bay_alt: `${base}/assets/photography/cooks_bay.jpg`,
		hawaii_canyon: `${base}/assets/photography/hawaii_canyon.JPG`,
		fern_closeup: `${base}/assets/photography/fern_closeup.jpg`,
		windy_hill_forest: `${base}/assets/windy_hill_forest_1.jpg`
	},

	// Common/shared assets
	common: {
		profile: `${base}/assets/profile.JPG`,
		moon: `${base}/assets/moon_pic.JPG`,
		moon_alt: `${base}/assets/moon_pic.jpg`
	},

	// 3D models (shared across pages)
	models: {
		blizzard_glb: `${base}/assets/blizzard.glb`,
		prop_glb: `${base}/assets/prop.glb`
	}
};
