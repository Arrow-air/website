import React from 'react';
import clsx from 'clsx';

export default function OpenSource(): JSX.Element {
	return (
		<React.Fragment>
			<article className="row justify-content-center text-center bg-lavender bg-opensource text-navy border-bottom border-navy">
				<div className="col-10 col-xl-5 pt-3 mb-5">
					<div className="row justify-content-center my-5">
						<img src="img/div_open.svg" className="col-4 col-sm-3 col-md-2 col-xl-3 img-fluid" alt="Open Source"/>
					</div>

					<div className="row justify-content-center">
						<h3 className="my-3 text-nowrap">Open Source Hardware</h3>
						<p className="mt-3 fs-5">
							We believe that the future of hardware engineering is open source, collaborative, and community owned.
						</p>
					</div>
				</div>
			</article>

			<article className="row justify-content-center bg-blue bg-opensource-sub text-navy border-bottom border-navy">
				<div className="col-10 col-xl-6 mb-5">
					<div className="row">
						<div className="d-flex-center-center col-12 col-lg-4 py-lg-5 mt-5">
							<img src="img/software-engineering@2x.png" className="img-fluid" alt="Software Based Engineering"/>
						</div>
						<div className="col-12 col-lg-8 p-3 p-sm-5 mt-lg-5">
							<h3 className="fs-5 pb-2"><span className="text-orange me-1">1.</span> Software Based Engineering</h3>
							<p className="pt-3">
							Recent advancements in engineering design tools allow for most of the design and iteration process to take place in the digital realm.
							</p>
							<p className="pt-3">
							At <strong>Arrow</strong>, we can collaborate digitally to design our aircraft and a highly automated manufacturing process to build it. We'll need a much smaller team on the ground to complete the assembly.
							</p>
						</div>
					</div>
				</div>
			</article>
			<article className="row justify-content-center bg-blue bg-opensource-sub text-navy border-bottom border-navy">
				<div className="col-10 col-xl-6 mb-5">
					<div className="row">
						<div className="d-flex-center-center col-12 col-lg-4 py-lg-5 mt-5 order-0 order-lg-1">
							<img src="img/crypto-alignment@2x.png" className="img-fluid" alt="Crypto for Alignment of Incentives"/>
						</div>
						<div className="col-12 col-lg-8 p-3 p-sm-5 mt-lg-5 order-1 order-lg-0">
							<h3 className="fs-5 pb-2"><span className="text-orange me-1">2.</span> Crypto for Alignment of Incentives</h3>
							<p className="pt-3">
							All of the business logic for <strong>Arrow</strong> will live on the Ethereum blockchain. Using this, we can easily send tokens to reward people who make meaningful contributions to our open source work.
							</p>
							<p className="pt-3">
							There will be a strong incentive for people to join and collaborate instead of competing and stealing.
							</p>
						</div>
					</div>
				</div>
			</article>
			<article className="row justify-content-center bg-blue bg-opensource-sub text-navy">
				<div className="col-10 col-xl-6 mb-5">
					<div className="row">
						<div className="d-flex-center-center col-12 col-lg-4 py-lg-5 mt-5">
							<img src="img/idea-meritocracy@2x.png" className="img-fluid" alt="Idea Meritocracy"/>
						</div>
						<div className="col-12 col-lg-8 p-3 p-sm-5 mt-lg-5">
							<h3 className="fs-5 pb-2"><span className="text-orange me-1">3.</span> Idea Meritocracy</h3>
							<p className="pt-3">
							The software world has already figured this out, but when everything is shared publicly, ideas become way more important than everything else. In order to contribute to a traditional hardware company, you would need to be located in the right place, have the right credentials, and pass a series of interviews before you even get to look at the good stuff.
							</p>
							<p className="pt-3">
							At <strong>Arrow</strong>, none of that matters. Good ideas are always rewarded, no matter who you are. Inevitably, this results in more good ideas.
							</p>
						</div>
					</div>
				</div>
			</article>
		</React.Fragment>
	);
}