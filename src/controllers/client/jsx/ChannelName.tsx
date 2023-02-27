// ! This should be moved into @revoltchat/ui
import {Channel} from "revolt.js";

import {Text} from "preact-i18n";
import {useParams} from "react-router-dom";
import {useClient} from "../ClientController";

interface Props {
    channel?: Channel;
    prefix?: boolean;
}

/**
 * Channel display name
 */
export function ChannelName({channel, prefix}: Props) {
    const {server: server_id} =
        useParams<{ server: string; channel?: string }>();
    const client = useClient();
    if (server_id) {
        const server = client.servers.get(server_id);
        return <>{server?.name}</>
    }

    if (!channel) return <></>;


    if (channel.channel_type === "SavedMessages")
        return <Text id="app.navigation.tabs.saved" />;

    if (channel.channel_type === "DirectMessage") {
        return (
            <>
                {prefix && "@"}
                {channel.recipient!.username}
            </>
        );
    }

    if (channel.channel_type === "TextChannel" && prefix) {
        return <>{`#${channel.name}`}</>;
    }

    return <>{channel.name}</>;
}
