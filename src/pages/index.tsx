import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OpenSource from '../components/OpenSource';
import Ecosystem from '../components/Ecosystem';
import VTOL from '../components/VTOL';

function HomepageHeader() {
	const {siteConfig} = useDocusaurusContext();
	return (
		<header>
			<div className="top-banner row d-flex justify-content-center position-relative">
				<div className="col-12 col-sm-10 col-xl-6 mt-xl-5 text-white">
					<div className="my-5 text-center">
						<h2 className="text-nowrap text-bg-navy-padded text-bold">
							<span>
								We're Bringing<br/>
								<text className="text-lavender">Point to Point Air Travel</text><br/>
								to Everyone
							</span>
						</h2>
					</div>
				</div>
				<div className="col-12 col-sm-10 col-xl-8 position-relative px-0">
					<img src="img/hero-image.png" className="img-fluid"/>
				</div>
			</div>

			<div className="row justify-content-center bg-banner-gradient text-center text-light py-5">
				<div className="col-10 col-xl-6">
					<div className="row justify-content-center position-relative">
						<div className="col-7 col-sm-6 col-lg-5 d-flex flex-wrap justify-content-center">
							<div className="fst-italic small text-center w-100" style={{color: '#b6b6d7'}}>
								Sound Exciting?
							</div>
							<a href="https://discord.com/invite/fab4bxaAW9" className="discord-button"><img src="img/button-render.png" alt="Discord" className="img-fluid"/></a>
						</div>
					</div>
					<div className="row justify-content-center position-relative my-3">
						<h3 className="col-12 col-md-10 col-lg-8 col-xl-7 text-bg-blue-padded text-white">
							<span>Fly between <text className="text-orange">any two points</text> on Earth, using <text className="text-lavender">open source hardware</text> from a <text className="text-orange">global team</text></span>
						</h3>
					</div>
				</div>
			</div>
		</header>
	);
}

export default function Home(): JSX.Element {
	const {siteConfig} = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description={`${siteConfig.tagline}`}>
			<div className="container-fluid h-100">
				<HomepageHeader />

				<div className="row divider p-2"></div>

				<article className="row justify-content-center text-center bg-gray-light bg-about text-navy">
					<div className="col-10 col-xl-6 pb-5 pt-3">
						<div className="row justify-content-center my-5">
							<img src="img/div_about.svg" className="col-4 col-sm-3 col-md-2 img-fluid" alt="About"/>
						</div>
						<div className="row justify-content-center">
							<h3 className="col-12 mb-5 text-nowrap">What is Arrow?</h3>
							<p className="col-12 mb-5 fs-5">
							<strong>Arrow</strong> is building open source vertical-takeoff aircraft and a rideshare protocol that will bring point to point air travel to everyone.
							</p>
							<div className="col-6 px-3 px-lg-5">
								<img src="img/global-community-divider.png" className="img-fluid" alt="Global community"/>
								<p>We are growing a <strong>global community</strong> of dreamers who believe that air travel is <strong>ripe for disruption</strong>, and we can all do it together.</p>
							</div>
							<div className="col-6 px-3 px-lg-5">
								<img src="img/core-mission-divider.png" className="img-fluid" alt="Core mission"/>
								<p>Our core mission is to increase <strong>human physical connectedness</strong> by building infrastructure for <strong>on-demand</strong>, rapid travel between <strong>any two points on Earth.</strong></p>
							</div>
						</div>
					</div>
				</article>

				<Ecosystem />

				<div className="row divider p-2"></div>

				<OpenSource />

				<div className="row divider-dark p-2"></div>

				<VTOL />

				<div className="row divider p-2"></div>

				<div className="row justify-content-center bg-white pt-5 py-3 py-sm-5 pb-4">
					<div className="col-8 col-sm-6 col-md-5 col-lg-4 col-xl-3 text-center px-xl-5">
						<p>
						We are community led and have many roles for contributors in our friendly Discord
						</p>
						<div class="px-5"><a href="https://discord.com/invite/fab4bxaAW9" className="discord-button my-xl-5"><img src="img/button-render.png" alt="Discord" className="img-fluid"/></a></div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
