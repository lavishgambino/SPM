import ArcLogo from "./ArcLogo";

const WelcomeScreen = () => (
  <div className="flex flex-col items-center">
    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
      <ArcLogo className="w-6 h-7 text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-semibold text-foreground mb-1">Arc Planning</h1>
    <p className="text-sm text-muted-foreground">Your strategy canvas</p>
  </div>
);

export default WelcomeScreen;
