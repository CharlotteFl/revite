// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min";
import Web3 from "web3";
import {UniPassProvider} from "@unipasswallet/ethereum-provider";


declare global {
    interface Window {
        ethereum: any;
        okexchain: any;
    }
}
export const MetaMask = 'metamask';
export const OKX = 'okx';
export const WalletConnect = 'walletconnect';

export const UniPass = 'uniPass';

export type WalletType = typeof MetaMask | typeof OKX | typeof WalletConnect | typeof UniPass;

const id = 80001;
const connectMetaMask = async (refresh: boolean) => {
    const provider = window.ethereum;
    if (!provider) throw new Error('No metamask installed');
    const status = await provider._metamask.isUnlocked();
    if (!status && refresh) throw new Error('Metamask locked');
    const accounts: string[] = await provider.request({
        method: 'eth_requestAccounts',
    });
    const web3 = new Web3(provider);
    // const chainId = await web3.eth.getChainId();
    // if (chainId !== id) throw new Error('The network connected is not correct');
    return {web3, address: accounts[0]};
};

const connectOkx = async () => {
    const provider = window.okexchain;
    if (!provider) throw new Error('No OKX installed');
    const accounts: string[] = await provider.enable();
    const web3 = new Web3(provider);
    // const chainId = Number(provider.chainId);
    // if (chainId !== id) throw new Error('The network connected is not correct');
    return {web3, address: accounts[0]};
};

const connectWalletConnect = async (refresh: boolean) => {
    const provider = new WalletConnectProvider({
        rpc: {
            [80001]: 'https://polygon-testnet.public.blastapi.io',
        },
    });
    await provider.enable();
    provider?.once('disconnect', () => {
        localStorage.removeItem('walletconnect');
        localStorage.removeItem('connectType');
        location.href = location.origin;
    });
    if (refresh && !provider.connected) {
        await provider.connector.killSession();
        throw new Error('Connection interruption');
    }
    // if (provider.chainId !== id) {
    //     await provider.disconnect();
    //     throw new Error('The network connected is not correct');
    // }
    const web3 = new Web3(provider as never);
    return {web3, address: provider.accounts[0]};
};

const connectUnipass = async () => {
    const upProvider = new UniPassProvider({
        chainId: id,
        returnEmail: false,
    });
    await upProvider.connect()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const address = upProvider.account.address;
    const web3 = new Web3(upProvider);
    return {web3, address}
};

export const connect = (connectType: WalletType, refresh = false) => {
    return connectType === MetaMask
        ? connectMetaMask(refresh)
        : connectType === OKX
            ? connectOkx()
            : connectType === WalletConnect
                ? connectWalletConnect(refresh) :
                connectType === UniPass ?
                    connectUnipass()
                    : Promise.reject();
};

