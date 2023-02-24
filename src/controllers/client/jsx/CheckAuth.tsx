import {observer} from "mobx-react-lite";
import {Redirect} from "react-router-dom";

import {Preloader} from "@revoltchat/ui";

import {clientController} from "../ClientController";
import {useEffect, useState} from "react";

interface Props {
    auth?: boolean;
    blockRender?: boolean;

    children: Children;
}

/**
 * Check that we are logged in or out and redirect accordingly.
 * Also prevent render until the client is ready to display.
 */
export const CheckAuth = observer((props: Props) => {
    const loggedIn = clientController.isLoggedIn();
    const [loading, setLoading] = useState(false);
    const params = new URLSearchParams(location.search)
    const token = params.get("token");

    useEffect(() => {
        async function fetch() {
            if (token) {
                setLoading(true);
                await clientController.login(token);
                setLoading(false);
            }
        }

        fetch()
    }, [])

    if (loading) {
        return <Preloader type="spinner" />;
    } else if (props.auth && !loggedIn) {
        if (props.blockRender) return null;
        return <Redirect to="/login" />;
    } else if (!props.auth && loggedIn) {
        if (props.blockRender) return null;
        return <Redirect to="/" />;
    }


    // Redirect if logged out on authenticated page or vice-versa.
    // if (props.auth && !loggedIn) {
    //     if (props.blockRender) return null;
    //     if (token) {
    //         return <>{props.children}</>;
    //     }
    //     return <Redirect to="/login"/>;
    // }
    // else if (!props.auth && loggedIn) {
    //     if (props.blockRender) return null;
    //     return <Redirect to="/" />;
    // }

    // Block render if client is getting ready to work.
    if (
        props.auth &&
        clientController.isLoggedIn() &&
        !clientController.isReady()
    ) {
        return <Preloader type="spinner"/>;
    }

    return <>{props.children}</>;
});
