import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Bar = styled.nav`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 54px;
  gap: 6px;
  position: sticky;
  top: 0;
  z-index: 100;

  overflow-x: auto; /* 🔥 KEY FIX */
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.ink};
  margin-right: 16px;
  flex-shrink: 0; /* 🔥 important */
`;

const LogoMark = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavTab = styled(NavLink)`
  display: flex;
  align-items: center;
  height: 54px;
  padding: 0 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.ink3};
  border-bottom: 2px solid transparent;
  text-decoration: none;
  transition: all 0.15s ease;
  font-weight: 400;
  letter-spacing: 0.01em;

  white-space: nowrap;      /* 🔥 prevent wrapping */
  flex-shrink: 0;           /* 🔥 prevent squishing */

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }

  &.active {
    color: ${({ theme }) => theme.colors.accent};
    border-bottom-color: ${({ theme }) => theme.colors.accent};
    font-weight: 500;
  }
`;

/* =========================
   Navbar Component
========================= */
const Navbar = () => {
  return (
    <Bar>
      <Logo>
        <LogoMark>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff">
            <rect x="1" y="4" width="12" height="2" rx="1" />
            <rect x="1" y="8" width="8" height="2" rx="1" />
            <circle cx="11" cy="9" r="2" />
          </svg>
        </LogoMark>
        SR Protein
      </Logo>

      <NavTab to="/">Dashboard</NavTab>
      <NavTab to="/purchase">Purchase</NavTab>
      <NavTab to="/sales">Sales</NavTab>
      <NavTab to="/inventory">Inventory</NavTab>
    </Bar>
  );
};

export default Navbar;