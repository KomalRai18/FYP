import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./auth.jsx";
import Browser from "./browser.tsx";
function Body() {
    const appRouter = createBrowserRouter([
        {
            path: '/',
            element: <Auth/>
        },
        {
            path: '/browser',
            element: <Browser/>
        }
    ])
    return (
        <>
            <RouterProvider router={appRouter}/>
        </>
    )
}
export default Body