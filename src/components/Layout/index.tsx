import React, { Suspense } from "react";
import { useLocation } from "react-router";
import FullScreenLoading from "./FullScreenLoading";
import GuestLayout from "./GuestLayout";
import MainLayout from "./MainLayout";

const guest_layouts = /^(\/logout|\/login|\/forgot-password|\/new-password)$/;

export default function Layout() {
  const location = useLocation();

  if (guest_layouts.test(location.pathname)) {
    return <GuestLayout />;
  } else {
    return (
      <Suspense fallback={<FullScreenLoading />}>
        <MainLayout />
      </Suspense>
    );
  }
}
