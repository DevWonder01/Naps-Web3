/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface SimpleStorageInterface extends ethers.utils.Interface {
  functions: {
    "get()": FunctionFragment;
    "set(uint256)": FunctionFragment;
    "storedData()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "get", values?: undefined): string;
  encodeFunctionData(functionFragment: "set", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "storedData",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "get", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "set", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "storedData", data: BytesLike): Result;

  events: {};
}

export class SimpleStorage extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: SimpleStorageInterface;

  functions: {
    get(overrides?: CallOverrides): Promise<[BigNumber]>;

    "get()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    set(x: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

    "set(uint256)"(
      x: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    storedData(overrides?: CallOverrides): Promise<[BigNumber]>;

    "storedData()"(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  get(overrides?: CallOverrides): Promise<BigNumber>;

  "get()"(overrides?: CallOverrides): Promise<BigNumber>;

  set(x: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  "set(uint256)"(
    x: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  storedData(overrides?: CallOverrides): Promise<BigNumber>;

  "storedData()"(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    get(overrides?: CallOverrides): Promise<BigNumber>;

    "get()"(overrides?: CallOverrides): Promise<BigNumber>;

    set(x: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "set(uint256)"(x: BigNumberish, overrides?: CallOverrides): Promise<void>;

    storedData(overrides?: CallOverrides): Promise<BigNumber>;

    "storedData()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    get(overrides?: CallOverrides): Promise<BigNumber>;

    "get()"(overrides?: CallOverrides): Promise<BigNumber>;

    set(x: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "set(uint256)"(x: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    storedData(overrides?: CallOverrides): Promise<BigNumber>;

    "storedData()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    get(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "get()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    set(x: BigNumberish, overrides?: Overrides): Promise<PopulatedTransaction>;

    "set(uint256)"(
      x: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    storedData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "storedData()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
