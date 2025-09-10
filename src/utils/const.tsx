export const scanVerdictDetails = {
  updated_at: 1644946377780273000,
  created_at: 1644946333762,
  revenue: "$50,000.00",
  employees: 6,
  industry: "Computer Services",
  connector_results: {
    "brand-fetch": {
      metadata: {
        employees: null,
        industry: [
          {
            score: 0.381166,
            label: "technology and computing/web development",
          },
          { score: 0.327783, label: "technology and computing/browsers" },
          { score: 0.182859, label: "technology and computing/web hosting" },
        ],
        revenue: null,
      },
      status: "success",
    },
    "poly-swarm": {
      metadata: { isMal: false },
      status: "success",
      verdict: "approve",
    },
    shodan: {
      metadata: {
        vuln_data: [],
        domain_data: {
          domains: [
            {
              subdomain: "",
              type: "A",
              ports: [80, 443],
              last_seen: "2022-01-26T16:02:28.403914+00:00",
              value: "99.84.238.127",
              tags: ["cloud"],
            },
            {
              subdomain: "",
              type: "A",
              ports: [80, 443],
              last_seen: "2022-01-26T16:02:28.310568+00:00",
              value: "99.84.238.193",
              tags: ["cloud"],
            },
            {
              subdomain: "",
              type: "A",
              ports: [80, 443],
              last_seen: "2022-01-26T16:02:28.407391+00:00",
              value: "99.84.238.98",
              tags: ["cloud"],
            },
            {
              subdomain: "",
              type: "A",
              ports: [80, 443],
              last_seen: "2022-01-26T16:02:28.409962+00:00",
              value: "99.84.238.110",
              tags: ["cloud"],
            },
            {
              subdomain: "",
              type: "A",
              last_seen: "2022-02-10T07:03:59.157790+00:00",
              value: "108.139.1.59",
            },
            {
              subdomain: "",
              type: "A",
              last_seen: "2022-02-10T07:03:59.162629+00:00",
              value: "108.139.1.92",
            },
            {
              subdomain: "",
              type: "A",
              last_seen: "2022-02-10T07:03:59.166601+00:00",
              value: "108.139.1.122",
            },
            {
              subdomain: "",
              type: "A",
              last_seen: "2022-02-10T07:03:59.172120+00:00",
              value: "108.139.1.43",
            },
            {
              subdomain: "",
              type: "MX",
              last_seen: "2022-01-26T16:02:28.262412+00:00",
              value: "alt1.aspmx.l.google.com",
            },
            {
              subdomain: "",
              type: "MX",
              last_seen: "2022-01-26T16:02:28.247935+00:00",
              value: "aspmx.l.google.com",
            },
            {
              subdomain: "",
              type: "MX",
              last_seen: "2022-01-26T16:02:28.252944+00:00",
              value: "alt3.aspmx.l.google.com",
            },
            {
              subdomain: "",
              type: "MX",
              last_seen: "2022-01-26T16:02:28.257843+00:00",
              value: "alt4.aspmx.l.google.com",
            },
            {
              subdomain: "",
              type: "MX",
              last_seen: "2022-01-26T16:02:28.267099+00:00",
              value: "alt2.aspmx.l.google.com",
            },
            {
              subdomain: "",
              type: "NS",
              last_seen: "2022-02-10T07:03:59.142147+00:00",
              value: "ns-1868.awsdns-41.co.uk",
            },
            {
              subdomain: "",
              type: "NS",
              last_seen: "2022-02-10T07:03:59.135550+00:00",
              value: "ns-1144.awsdns-15.org",
            },
            {
              subdomain: "",
              type: "NS",
              last_seen: "2022-02-10T07:03:59.146742+00:00",
              value: "ns-454.awsdns-56.com",
            },
            {
              subdomain: "",
              type: "NS",
              last_seen: "2022-02-10T07:03:59.151341+00:00",
              value: "ns-855.awsdns-42.net",
            },
            {
              subdomain: "",
              type: "SOA",
              last_seen: "2022-01-26T16:02:28.271769+00:00",
              value: "ns-855.awsdns-42.net",
            },
            {
              subdomain: "",
              type: "TXT",
              last_seen: "2022-01-26T16:02:28.244154+00:00",
              value: "v=spf1 include:_spf.google.com ~all",
            },
            {
              subdomain: "_dmarc",
              type: "TXT",
              last_seen: "2022-02-10T07:03:59.131988+00:00",
              value:
                "v=DMARC1; p=none; rua=mailto:info+dmarc-reports@uiops.com",
            },
            {
              subdomain: "waratah-quoter-staging",
              type: "CNAME",
              last_seen: "2022-02-14T05:22:37.113165+00:00",
              value: "glitch.edgeapp.net",
            },
            {
              subdomain: "waratah-test",
              type: "CNAME",
              last_seen: "2022-02-14T05:21:12.826522+00:00",
              value: "gracious-goldwasser-e49205.netlify.app",
            },
          ],
          subdomains: ["_dmarc", "waratah-quoter-staging", "waratah-test"],
        },
      },
      status: "success",
      verdict: "approve",
    },
    "web-risk": {
      metadata: { isMal: false },
      status: "success",
      verdict: "approve",
    },
  },
  id: "f586d1d7-22cb-478a-a298-240db1b67883",
  domain: "uiops.com",
  status: "success",
  verdict: "approve",
};

export const applicationStages = [
  {
    id: 1,
    name: "Quote",
  },
  {
    id: 2,
    name: "Bound",
  },
  {
    id: 3,
    name: "Declined",
  },
  {
    id: 4,
    name: "Issued",
  },
];
