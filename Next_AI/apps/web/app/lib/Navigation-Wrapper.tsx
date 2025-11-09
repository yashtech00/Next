import { cookies } from "next/headers";
import Navigation from "@/components/Navigation";

export default async function NavigationWrapper ()  {
  const jwt = (await cookies()).get("jwt")?.value;
  console.log(jwt,"jwt");
  
  const isLoggedIn = !!jwt;

  return <Navigation isLoggedIn={isLoggedIn} />;
}
