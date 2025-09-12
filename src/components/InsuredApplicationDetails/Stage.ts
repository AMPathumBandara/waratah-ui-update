import { createMachine } from "xstate";
import Profile from "./Profile";
import Quote from "./Quote";
import Bind from "./Bind";

export const applicationStateMachine = (initialState: string) =>
  createMachine({
    id: "application",
    initial: initialState,
    context: {
      step: 0,
    },
    states: {
      created: {
        on: {
          next: "profile",
        },
        meta: {
          label: "Created",
          index: 0,
          component: Profile,
        },
      },
      profile: {
        on: {
          next: "quote",
        },
        meta: {
          label: "Profile",
          index: 0,
          component: Profile,
        },
      },
      quote: {
        on: {
          next: "bound",
          back: "profile",
          referred: "declined",
        },
        meta: {
          label: "Quote",
          index: 1,
          component: Quote,
        },
      },
      declined: {
        on: {
          approved: "complete",
          rejected: "complete",
        },
        meta: {
          label: "Quote",
          index: 1,
          component: Quote,
        },
      },
      notTakenUp: {
        on: {
          approved: "complete",
          rejected: "complete",
        },
        meta: {
          label: "Quote",
          index: 1,
          component: Quote,
        },
      },
      bound: {
        on: {
          next: "issued",
          back: "quote",
        },
        meta: {
          label: "Bound",
          index: 2,
          component: Bind,
        },
      },
      issued: {
        on: {
          next: "complete",
        },
        meta: {
          label: "Issued",
          index: 4,
          component: Bind,
        },
      },
      complete: {
        type: "final",
      },
    },
  });
