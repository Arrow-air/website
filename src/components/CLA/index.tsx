import React, {useEffect, useState} from 'react';
import toast, { Toaster } from 'react-hot-toast';

import CLAText from './CLAText'
const GITHUB_CLIENT_ID_PRD = '825ac8e5815ccf3fa411';
const GITHUB_CLIENT_ID_STG = '9830b30b4d8e0f1bba78';
const SIGN_API_URL = '/api/v1/cla/user/sign';

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
    const error = urlParams.get('error');
    if(error){
      toast.error('There was a problem when signing the CLA.');
      console.log(error);
      console.log(urlParams.get('error_description'));
      console.log(urlParams.get('error_uri'));
    }
  }, [])

  function authWithGithub(){
    const GITHUB_CLIENT_ID = window.location.hostname == 'www.arrowair.com' ? GITHUB_CLIENT_ID_PRD : GITHUB_CLIENT_ID_STG
    window.open(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user`)
  }

  function handleCLACheckbox(){
    localStorage.setItem('claChecked', (!acceptedCLA).toString())
    setAcceptedCLA(!acceptedCLA)
  }

  async function sendGHCode(){
    //to test with staging or dev API url uncomment 2 lines below
    //const SIGN_API_URL = 'https://od4scuzjyymlzg46inlzsra4oa0rberi.lambda-url.eu-west-1.on.aws/api/v1/user/ghUser/sign'
    try {
      const resp = await fetch( SIGN_API_URL, {
        method: 'POST',
        //mode: 'no-cors',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({code: ghCode})
      });
      const data = await resp.json();
      if (data?.success){
        toast.success('CLA successfully signed!');
      } else {
        toast.error('There was a problem when signing the CLA.');
        console.log(data);
      }
    } catch (e){
      toast.error('There was a problem when signing the CLA.');
      console.log(e);
    }
  }

  return (
    <React.Fragment>
      <article className="row">
        <div className="sign-cla col-12">
          <div className="cla-scroll-box">
            <CLAText/>
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
      <Toaster toastOptions={{duration: 5000}}/>
    </React.Fragment>
  );
}
