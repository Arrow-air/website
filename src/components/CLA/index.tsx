import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import CLAText from './CLAText'
const GITHUB_CLIENT_ID = '825ac8e5815ccf3fa411';

export default function CLA(): JSX.Element {
	const [acceptedCLA, setAcceptedCLA ]= useState(false);
	const [ghCode, setGhCode ]= useState('');

	useEffect(() => {
		//on page load check if it's a new page load or after github auth redirect
		if (localStorage.getItem('claChecked') === 'true'){
			setAcceptedCLA(true);
		}
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		if (code){
			setGhCode(code);
		}
	}, [])

	function authWithGithub(){
		window.open(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user`)
	}

	function handleCLACheckbox(){
		localStorage.setItem('claChecked', (!acceptedCLA).toString())
		setAcceptedCLA(!acceptedCLA)
	}

	function sendGHCode(){
		window.alert('sending API request with GH auth code ' + ghCode)
	}

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
						<div className="d-flex">
							<input type={'checkbox'} checked={acceptedCLA} onClick={handleCLACheckbox}/>
							<span className="cb-text">I have read and agree to CLA</span>
						</div>
						{
							ghCode ?
								<button onClick={sendGHCode} disabled={!acceptedCLA}>
									<img src="/img/icons8-digital-signature-90.png" width={18} height={18}/>
									<span>Sign CLA</span>
								</button>
								:
								<button onClick={authWithGithub} disabled={!acceptedCLA}>
									<img src="/img/icons8-github-120.svg" width={22} height={22}/>
									<span>Sign in with GitHub</span>
								</button>
						}
					</div>
				</div>
			</article>
		</React.Fragment>
	);
}
