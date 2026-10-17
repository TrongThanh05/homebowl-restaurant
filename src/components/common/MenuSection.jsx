const MenuSection = () => {
  return (
    <section class="section-ourmenu bg2-pattern p-t-115 p-b-120">
      <div class="container">
        <div class="title-section-ourmenu t-center m-b-22">
          <span class="tit2 t-center">Discover</span>

          <h3 class="tit5 t-center m-t-2">Our Menu</h3>
        </div>

        <div class="row">
          <div class="col-md-8">
            <div class="row">
              <div class="col-sm-6">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-01.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size4">
                    Lunch
                  </Link>
                </div>
              </div>

              <div class="col-sm-6">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-05.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size5">
                    Dinner
                  </Link>
                </div>
              </div>

              <div class="col-12">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-13.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size6">
                    Happy Hour
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="row">
              <div class="col-12">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-08.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size7">
                    Drink
                  </Link>
                </div>
              </div>

              <div class="col-12">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-10.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size8">
                    Starters
                  </Link>
                </div>
              </div>

              <div class="col-12">
                <div class="item-ourmenu bo-rad-10 hov-img-zoom pos-relative m-t-30">
                  <img src="images/our-menu-16.jpg" alt="IMG-MENU" />
                  <Link to="#" class="btn2 flex-c-m txt5 ab-c-m size9">
                    Dessert
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default MenuSection;
