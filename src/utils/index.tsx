import AgentUnSigned from "icons/agent-unsigned.svg";
import AgentSigned from "icons/agent-signed.svg";
import InsuredSigned from "icons/insured-signed.svg";
import InsuredUnSigned from "icons/insured-unsigned.svg";
import PaymentCollected from "icons/payment-collected.svg";
import PaymentNotCollected from "icons/payment-not-collected.svg";
import { Order_By } from "generated/graphql";
export const direction = {
  asc: Order_By.Asc,
  desc: Order_By.Desc,
};

export const username_regx = /^[A-Za-z0-9]{2,15}(?:[_-][A-Za-z0-9]+)*$/;
export const name_regx = /^([a-zA-Z0-9'_-]+\s)*[a-zA-Z0-9'_-]+$/;
export const email_regx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const webAddress =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,15}(:[0-9]{1,5})?(\/.*)?$/; // TODO: need to address this later for better solution

export function currencyFormatter(amount: any) {
  if (typeof amount === 'number') {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0
    });
  }
  if (amount) {
    const sliptedAmount = amount?.split(".");
    const [rounded, decimal] = sliptedAmount;

    return rounded;
  } else {
    return "N/A";
  }
}

export function currencyFormatterWithCents(amount: any) {
  if (typeof amount === 'number') {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2
    });
  }
  if (amount) {
    return amount;
  } else {
    return "N/A";
  }
}

export function getHostName(url: any) {
  const hostName = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(`${url}`);

  if (hostName) {
    return hostName[1];
  } else {
    return "";
  }
}

function stripWWW(domain: string) {
  return domain.replace(/^www\./, "");
}
export function getDomain(url: string) {
  let sanitizedUrl = url;

  if (!url.toLowerCase().startsWith("http")) {
    sanitizedUrl = `http://${url}`;
  }

  const { hostname } = new URL(sanitizedUrl);

  return stripWWW(hostname);
}

export const NavigationAccess = [
  {
    name: "Home",
    path: "/",
    isParent: true,
    allowUsers: ["broker", "broker_power"],
  },
  {
    name: "Applications",
    path: "/applications",
    isParent: true,
    allowUsers: ["broker", "super_admin", "tenant_admin", "broker_power"],
  },
  {
    name: "Applications",
    path: "/applications/:id",
    isParent: false,
    allowUsers: ["broker", "super_admin", "tenant_admin", "broker_power"],
  },
  {
    name: "ApplicationsNewLayout",
    path: "/applications-list",
    isParent: false,
    allowUsers: ["broker", "super_admin", "tenant_admin", "broker_power"],
  },
  {
    name: "Tennats",
    path: "/tenants/*",
    isParent: true,
    allowUsers: ["super_admin", "tenant_admin"],
  },
];

export function AgentSignedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={AgentSigned} />
    </div>
  );
}
export function AgentUnSignedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={AgentUnSigned} />
    </div>
  );
}
export function InsuredSignedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={InsuredSigned} />
    </div>
  );
}
export function InsuredUnSignedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={InsuredUnSigned} />
    </div>
  );
}
export function PaymentCollectedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={PaymentCollected} />
    </div>
  );
}
export function PaymentNotCollectedIcon() {
  return (
    <div>
      <img className="bind-status-icons" src={PaymentNotCollected} />
    </div>
  );
}

export function PrettyPrint(props: any) {
  return (
    <pre className="json-pretty-style">
      {JSON.stringify(props.jsonObj, null, 2)}
    </pre>
  );
}
