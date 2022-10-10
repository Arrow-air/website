import React from 'react';
import clsx from 'clsx';

export default function Ecosystem(): JSX.Element {
  return (
    <React.Fragment>
    <article className="row justify-content-center text-center bg-white text-blue-dark bg-ecosystem border-top border-lavender-light">
        <div className="col-10 col-xl-5 pt-3">
        <div className="row justify-content-center my-5">
            <img src="img/div_eco.svg" className="col-4 col-sm-3 col-md-2 col-xl-3 img-fluid" alt="Ecosystem"/>
        </div>

        <div className="row justify-content-center mb-3">
            <h3 className="mb-5 text-nowrap">Our ecosystem</h3>
            <p className="fs-5">
            The <strong>Arrow</strong> protocol will bring together builders, riders, operators, and many more in a way never before possible.
            </p>
        </div>

        <div className="row justify-content-center row-cols-2 row-cols-sm-2 row-cols-md-3 g-5 fs-7 mb-5">
            <div className="col">
            <div className="card h-100">
                <div className="row card-body text-center px-2">
                <h5 className="fs-6 col-12 order-2 order-md-1 py-3 card-text">Vertical Takeoff Aircraft</h5>
                <div className="col-10 order-1 order-lg-2">
                    <img src="img/vtol@2x.png" className="img-fluid" alt="Vertical Takeoff Aircraft"/>
                </div>
                </div>
            </div>
            </div>
            <div className="col">
            <div className="card h-100">
                <div className="row card-body text-center px-2">
                <h5 className="fs-6 col-12 order-2 order-md-1 py-3 card-text">Point to Point</h5>
                <div className="col-10 order-1 order-lg-2">
                    <img src="img/p2p@2x.png" className="img-fluid" alt="Point to Point"/>
                </div>
                </div>
            </div>
            </div>
            <div className="col">
            <div className="card h-100">
                <div className="row card-body text-center px-2">
                <h5 className="fs-6 col-12 order-2 order-md-1 py-3 card-text">Connect Humans</h5>
                <div className="col-10 order-1 order-md-2">
                    <img src="img/connect@2x.png" className="img-fluid" alt="Connect humans"/>
                </div>
                </div>
            </div>
            </div>
            <div className="col-md-9 d-none d-md-block mt-0">
            <div className="card h-100">
                <div className="card-body text-center p-0">
                <img src="img/spider-diagram.png" className="img-fluid"/>
                </div>
            </div>
            </div>
            <div className="col mt-md-0">
            <div className="card h-100">
                <div className="card-body text-center px-2 row">
                <div className="col-10">
                    <img src="img/rideshare@2x.png" className="img-fluid" alt="Rideshare Protocol"/>
                </div>
                <h5 className="fs-6 py-3 card-text">Rideshare Protocol</h5>
                </div>
            </div>
            </div>
            <div className="col mt-md-0">
            <div className="card h-100">
                <div className="card-body text-center px-2 row">
                <div className="col-10">
                    <img src="img/global@2x.png" className="img-fluid" alt="Global Team"/>
                </div>
                <h5 className="fs-6 py-3 card-text text-nowrap">Global Team</h5>
                </div>
            </div>
            </div>
            <div className="col mt-md-0">
            <div className="card h-100">
                <div className="card-body text-center px-2 row">
                <div className="col-10">
                    <img src="img/collab@2x.png" className="img-fluid" alt="Collaborative"/>
                </div>
                <h5 className="fs-6 py-3 card-text text-nowrap">Collaborative</h5>
                </div>
            </div>
            </div>
        </div>
        </div>
    </article>
    </React.Fragment>
  );
}
