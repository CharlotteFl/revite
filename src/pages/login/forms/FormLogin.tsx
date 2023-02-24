import {clientController} from "../../../controllers/client/ClientController";
import {Form} from "./Form";
import metamask_png from '../../../assets/img/metamask.png';
import walletConnect_png from '../../../assets/img/walletconnect.png';
import okx_png from '../../../assets/img/okx.png';
import unipass_png from '../../../assets/img/unipass.png';

import styles from "../Login.module.scss";

import {connect, WalletType, WalletConnect, MetaMask, UniPass, OKX} from "../../../utils/connect"
import {useRef, useState} from "react";
import Web3 from "web3";
import {Text} from "preact-i18n";
import {Button} from "@revoltchat/ui";
import axios from "axios"

export function FormLogin() {
    // return <Form page="login" callback={clientController.login} />;

    const [address, setAddress] = useState('');
    const [web3, setWeb3] = useState<Web3>();
    const walletList: { name: WalletType, icon: string }[] = [
        {
            icon: unipass_png,
            name: UniPass,
        }, {
            icon: walletConnect_png,
            name: WalletConnect,
        },
        {
            icon: metamask_png,
            name: MetaMask,
        },
        {
            icon: okx_png,
            name: OKX,
        },
    ];
    const [type, setType] = useState<WalletType>(MetaMask)

    const connectWallet = (connectType: WalletType) => {
        connect(connectType).then(({address, web3}) => {
            setAddress(address);
            setWeb3(web3);
            setType(type);
        }).catch(err => {
            console.log(err)
        })
    };

    const disconnect = () => {
        if (!web3) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        web3?.currentProvider?.disconnect?.();
        setAddress('');
    }

    const login = async () => {
        if (!address && !web3) return;
        const timespan = Date.now();
        const message = `${address} login FavorTube at ${timespan}`;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const signature = await web3.eth.personal.sign(message, address)
            .catch((err) => {
                console.log(err);
            });
        if (!signature) return;

        const typeData = {
            [WalletConnect]: 'wallet_connect',
            [MetaMask]: 'meta_mask',
            [OKX]: 'okx',
            [UniPass]: 'unipass',
        };

        const {data} = await axios({
            method: "post",
            url: import.meta.env.VITE_LOGIN_URL + '/v1/auth/login',
            data: {
                timestamp: timespan,
                wallet_addr: address,
                signature: signature,
                type: typeData[type]
            }
        })
        clientController.login(
            data.data.token
        )
    }

    return <>
        {walletList.map((item) => (
            <div
                key={item.name}
                className={styles.wallet}
                onClick={() => connectWallet(item.name)}
            >
                <div
                    className={styles.icon}
                >
                    <img src={item.icon} alt={item.name}/>
                </div>
                <div
                    className={styles.name}
                >{item.name.toUpperCase()}</div>
            </div>
        ))}
        {
            address && <Button
                onClick={disconnect}
                className={styles.btn}
            >
                Disconnect
            </Button>
        }
        {
            address && <Button
                onClick={login}
                className={styles.btn}
            >
                <Text
                    id={"login.title"}
                />
            </Button>
        }
    </>
}
