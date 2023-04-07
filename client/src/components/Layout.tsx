import NavBar from "./NavBar";
import { Wrapper, WrapperVariant } from "./Wrapper";

interface LayoutProp {
  children?: any;
  variant?: WrapperVariant;
}

const Layout = ({ children, variant }: LayoutProp) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
