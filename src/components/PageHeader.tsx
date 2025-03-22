import logo from "../assets/LogoSerenity.png";

export function PageHeader() {
  return (
    <div className="flex gap-10 lg:gap-20 justify-between">
      <div className="flex gap-3 items-center">
        <a href="">
          <img src={logo} alt="Serenity" className="h-6" />
        </a>
        <a href="">
          <img src={logo} alt="Serenity" className="h-6" />
        </a>
        <a href="">
          <img src={logo} alt="Serenity" className="h-6" />
          <h1></h1>
        </a>
      </div>
    </div>
  );
}
