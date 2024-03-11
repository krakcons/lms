import Providers from "./Providers";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return <Providers>{children}</Providers>;
};

export default Layout;
