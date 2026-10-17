const SlideShow = () => {
    return(
        <section className="section-slide">
		<div className="wrap-slick1">
			<div className="slick1">
				<div className="item-slick1 item1-slick1" style="background-image: url(images/slide1-01.jpg);">
					<div className="wrap-content-slide1 sizefull flex-col-c-m p-l-15 p-r-15 p-t-150 p-b-170">
						<span className="caption1-slide1 txt1 t-center animated visible-false m-b-15" data-appear="fadeInDown">
							Welcome to
						</span>

						<h2 className="caption2-slide1 tit1 t-center animated visible-false m-b-37" data-appear="fadeInUp">
							Pato Place
						</h2>

						<div className="wrap-btn-slide1 animated visible-false" data-appear="zoomIn">
							<a href="menu.html" className="btn1 flex-c-m size1 txt3 trans-0-4">
								Look Menu
							</a>
						</div>
					</div>
				</div>

				<div className="item-slick1 item2-slick1" style="background-image: url(images/master-slides-02.jpg);">
					<div className="wrap-content-slide1 sizefull flex-col-c-m p-l-15 p-r-15 p-t-150 p-b-170">
						<span className="caption1-slide1 txt1 t-center animated visible-false m-b-15" data-appear="rollIn">
							Welcome to
						</span>

						<h2 className="caption2-slide1 tit1 t-center animated visible-false m-b-37" data-appear="lightSpeedIn">
							Pato Place
						</h2>

						<div className="wrap-btn-slide1 animated visible-false" data-appear="slideInUp">
							<a href="menu.html" className="btn1 flex-c-m size1 txt3 trans-0-4">
								Look Menu
							</a>
						</div>
					</div>
				</div>

				<div className="item-slick1 item3-slick1" style="background-image: url(images/master-slides-01.jpg);">
					<div className="wrap-content-slide1 sizefull flex-col-c-m p-l-15 p-r-15 p-t-150 p-b-170">
						<span className="caption1-slide1 txt1 t-center animated visible-false m-b-15" data-appear="rotateInDownLeft">
							Welcome to
						</span>

						<h2 className="caption2-slide1 tit1 t-center animated visible-false m-b-37" data-appear="rotateInUpRight">
							Pato Place
						</h2>

						<div className="wrap-btn-slide1 animated visible-false" data-appear="rotateIn">
							<a href="menu.html" className="btn1 flex-c-m size1 txt3 trans-0-4">
								Look Menu
							</a>
						</div>
					</div>
				</div>

			</div>

			<div className="wrap-slick1-dots"></div>
		</div>
	</section>
    )
};
export default SlideShow;