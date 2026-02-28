export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-dots">
                {[0,1,2,3].map(i => <div key={i} className="logo-dot" />)}
              </div>
            </div>
            <div>
              <div className="logo-name">GRINDSET</div>
              <div className="logo-tagline">optimize your lifestyle</div>
            </div>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            Tracking Active
          </div>
        </div>
      </div>
    </header>
  )
}
