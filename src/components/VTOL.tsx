import React from 'react';
import clsx from 'clsx';

type VTOLItem = {
	title: string;
	image: string;
	description: JSX.Element;
	index?: number;
};

const VTOLList: VTOLItem[] = [
	{
		title: 'Decentralized transportation',
		image: '/img/decentralized-future@2x.png',
		description: (
			<React.Fragment>
				<p className="mt-3">
					As the information economy continues to grow, people will have less reason to live in cities. If all of your work (and lots of your social life) is in the metaverse, many people will choose to live somewhere where they can get more space for less expense.
				</p>
				<p className="mt-3">
					The current city-based transportation infrastructure is entirely inadequate for a population of people that is more evenly spread out. This is where vertical takeoff and landing (VTOL) aircraft come into play. These aircraft can pick up passengers in their front yard and bring them anywhere else that they might want to go. Cities will have shared vertiports so that their citizens can access the more distant communities around them.
				</p>
			</React.Fragment>
		),
	},
	{
		title: 'The Rideshare Network',
		image: '/img/rideshare-future@2x.png',
		description: (
			<p className="mt-3">
				Users will primarily interface with Arrow aircraft through our rideshare protocol. This will be a network that connects operators of approved aircraft, landing zone and recharging/fueling providers, and people looking to travel. In time, we hope that this network will grow to provide global coverage. For each flight operated on our network, a small commission will be returned to the Arrow treasury so we can reinvest in growth.
			</p>
		),
	},
	{
		title: 'Decentralized transportation',
		image: '/img/public-benefit-future@2x.png',
		description: (
			<p className="mt-3">
				The Arrow treasury will grow along with the scale of the rideshare network. Eventually, we will have enough resources to fund advanced research that will not only benefit our aircraft, but also many other aspects of the technological world. These would be things like more energy-dense batteries, compact nuclear power, and new manufacturing techniques. Arrow will capture the value as it relates to VTOL aircraft, but all other applications will be free for public use.
			</p>
		),
	},
];

function VTOLItemRender({title, image, description, index}: VTOLItem) {
  return (
	<article className="row justify-content-center text-center bg-navy bg-future-sub text-lavender border-bottom border-orange">
		<div className="col-10 col-xl-4 mb-5">
			<div className="row justify-content-center my-5 pt-0 pt-md-5">
				<img src={image} className="col-6 col-sm-4 img-fluid" alt={title}/>
			</div>
			<div className="row justify-content-center">
				<h3 className="fs5 text-white"><span className="text-orange me-1">{index}.</span> {title}</h3>
				{description}
			</div>
		</div>
	</article>
  );
}

export default function VTOL(): JSX.Element {
	return (
		<React.Fragment>
			<article className="row justify-content-center text-center bg-navy bg-future text-white border-bottom border-orange">
				<div className="col-10 col-xl-5 pt-3 mb-5 pb-5">
					<div className="row justify-content-center my-5">
						<img src="/img/div_future.svg" className="col-4 col-sm-3 col-md-2 col-xl-3 img-fluid" alt="VTOL Future"/>
					</div>

					<div className="row justify-content-center">
						<h3 className="my-3 text-nowrap">The VTOL Future</h3>
						<p className="mt-3 fs-5">
						We believe in an optimistic future where transportation is highly efficient and human-focused. Here's how we get there.
						</p>
					</div>
				</div>
			</article>
			{VTOLList.map((props, idx) => (
				<VTOLItemRender key={idx} index={idx + 1} {...props}/>
			))}
		</React.Fragment>
	);
}
