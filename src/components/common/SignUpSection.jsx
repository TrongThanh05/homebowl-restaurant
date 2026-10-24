const SignUpSection = () => {
  return (
    <div className="section-signup bg1-pattern p-t-85 p-b-85">
      <form className="flex-c-m flex-w flex-col-c-m-lg p-l-5 p-r-5">
        <span className="txt5 m-10">Specials Sign up</span>

        <div className="wrap-input-signup size17 bo2 bo-rad-10 bgwhite pos-relative txt10 m-10">
          <input
            className="bo-rad-10 sizefull txt10 p-l-20"
            type="text"
            name="email-address"
            placeholder="Email Adrress"
          />
          <i className="fa fa-envelope ab-r-m m-r-18" aria-hidden="true"></i>
        </div>

        <button type="submit" className="btn3 flex-c-m size18 txt11 trans-0-4 m-10">
          Sign-up
        </button>
      </form>
    </div>
  );
};
export default SignUpSection;
