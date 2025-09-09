import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
};

const AuthLayout = ({
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) => {
  return (
    <div 
      className="bg-gradient-to-br from-background to-muted/30 px-4 py-8"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      {/* Card wrapper */}
      <div 
        className="bg-card rounded-2xl shadow-2xl border border-border p-8 gap-6"
        style={{
          width: '100%',
          maxWidth: '28rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        
        {/* children (form) */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {children}
        </div>

        {/* footer */}
        <div 
          className="pt-6 border-t border-border text-sm text-muted-foreground"
          style={{
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span>
            {footerText}{" "}
            <Link
              to={footerLink}
              className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
            >
              {footerLinkText}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;