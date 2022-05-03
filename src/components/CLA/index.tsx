import React, {useState} from 'react';
import clsx from 'clsx';
import CLAText from './CLAText'

export default function Index(): JSX.Element {
	const [acceptedCLA, setAcceptedCLA ]= useState(false);
	return (
		<React.Fragment>
			<article className="row">
				<div className="sign-cla col-12">
					<div className="cla-scroll-box">
						<p className="cla-text-wrapper">
							<CLAText/>
						</p>
					</div>
					<div className="controls">
						<p className="d-flex">
							<input type={'checkbox'} checked={acceptedCLA} onClick={() => setAcceptedCLA(!acceptedCLA)}/>
							<span className="cb-text">I have read and agree to CLA</span>
						</p>
						<button><img src="/img/icons8-github-120.svg" width={25} height={25}/>Sign in with GitHub</button>
					</div>
				</div>
			</article>
		</React.Fragment>
	);
}
