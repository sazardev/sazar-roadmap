import type { Curriculum } from "../types";
import { topic } from "../types";

export const networkEngineer: Curriculum = {
  slug: "network-engineer",
  title: "Network Engineering",
  tagline: "Packets, routes and trust boundaries, from cable to cloud.",
  description:
    "A guided path from the physical link to routed, switched, secured and automated networks. You will learn to read a packet capture, reason about an address plan, trace a route, design a wireless deployment, defend a perimeter and automate the configuration that makes the network reproducible. Every stage ends with a measurement or a running topology.",
  level: "intermediate",
  icon: "network",
  estimatedHours: 76,
  stages: [
    {
      slug: "fundamentals",
      title: "Foundations",
      description:
        "Build the mental model the rest of the path depends on: what a network is, how layers isolate problems, and how a request moves from an application to a link. By the end you can explain any hop in a request using the right layer and the right unit of data.",
      topics: [
        topic(
          "what-are-networks",
          "Every troubleshooting decision starts with deciding whether the problem is local to a host, local to the link, or outside the network boundary.",
          [
            "Host, link and forwarding device as the three network primitives",
            "LAN, WAN and internetwork boundaries",
            "Shared medium versus point-to-point link",
            "Reachability as a property of the path, not a single device",
          ],
          "Draw the network in your home or office: label every host, switch, access point and router, then mark the boundary where private addressing ends and the ISP begins.",
          {
            summary:
              "A network is a set of hosts connected by links and forwarding devices that agree on addressing and a shared set of protocols. The boundary is administrative as well as physical: hosts inside a network can often reach each other directly, while traffic to another network must pass a router.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Calling every connectivity failure a network problem without naming the link or boundary that failed; start at the host and walk outward.",
              "Treating the internet cloud as a single device; draw the first provider router and the last mile explicitly.",
              "Assuming a LAN is defined by physical location; a VLAN or a VPN can put two sites in one broadcast domain.",
            ],
            resources: [
              {
                title: "IBM: What is computer networking?",
                url: "https://www.ibm.com/think/topics/networking",
                kind: "article",
              },
              {
                title: "MDN: How does the Internet work?",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "how-does-the-internet-work",
          "A request can fail at name resolution, at route selection or at the destination, and the layer that failed determines who can fix it.",
          [
            "Autonomous systems and peering relationships",
            "Recursive DNS resolution before the first SYN",
            "Default-free routing and longest prefix match",
            "Last-mile access versus backbone transit",
          ],
          "Run `dig +trace example.com` and `traceroute example.com`, then annotate each output line with the network or hop that owns it.",
          {
            summary:
              "The internet is a network of autonomous systems that exchange routes with BGP and forward packets toward the longest matching prefix. DNS turns a name into an address, and each network hands the packet to a peer or transit provider that advertises a route to the destination.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Assuming the path is symmetric; return traffic often follows a different route and a different provider.",
              "Reading traceroute hops as a guaranteed forwarding path; load balancing can vary the path per probe.",
              "Blaming DNS for a timeout that actually occurs after the address is resolved; check whether a SYN was sent.",
            ],
            resources: [
              {
                title: "MDN: How does the Internet work?",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work",
                kind: "docs",
              },
              {
                title: "Cloudflare: How does the Internet work?",
                url: "https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "osi-model",
          "Without a layer model, teams replace cables, firewall rules and applications at random instead of testing the layer that actually failed.",
          [
            "Encapsulation and protocol data units per layer",
            "Layer boundaries and peer-to-peer communication",
            "Physical, data link, network, transport and application scope",
            "The model as a diagnostic vocabulary, not a strict implementation",
          ],
          "Take one HTTPS request and write the header added at each layer, from the Ethernet frame to the TLS record, with the byte size of each header.",
          {
            summary:
              "The OSI reference model divides communication into seven layers, each adding a header or trailer and each with its own unit of data. Its value is diagnostic: it forces you to say whether a failure is physical, a frame problem, a routing problem or an application problem before changing anything.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Mapping every protocol to exactly one layer; ARP and ICMP sit awkwardly across boundaries.",
              "Using the model as a build checklist instead of a diagnostic index.",
              "Calling a switch a layer-2 device when it also routes or filters at layer 3.",
            ],
            resources: [
              {
                title: "Cloudflare: What is the OSI model?",
                url: "https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/",
                kind: "article",
              },
              {
                title: "RFC 1122: Requirements for Internet Hosts",
                url: "https://www.rfc-editor.org/rfc/rfc1122.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "tcpip-model",
          "Diagnostic tools report in TCP/IP terms, so a mismatch between the OSI vocabulary and the tool output slows every investigation.",
          [
            "Link, internet, transport and application layers",
            "Where IPv4, IPv6, TCP, UDP and HTTP sit",
            "Encapsulation in the Linux network stack",
            "OSI mapping for troubleshooting conversations",
          ],
          "Capture one HTTPS packet with `tcpdump -nn -v`, then label its Ethernet, IP, TCP and TLS portions and map each to a TCP/IP layer.",
          {
            summary:
              "The TCP/IP model collapses OSI into link, internet, transport and application layers, and describes what the protocols actually implement. It is the model that matches the `ip` command, `tcpdump` and the headers you will read in a capture.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Equating the OSI application layer with a single process; HTTP, DNS and TLS all live above transport.",
              "Forgetting that the link layer includes both physical framing and local addressing.",
              "Treating the four-layer model as an RFC-defined standard; it is a descriptive convention.",
            ],
            resources: [
              {
                title: "RFC 1122: Requirements for Internet Hosts",
                url: "https://www.rfc-editor.org/rfc/rfc1122.html",
                kind: "docs",
              },
              {
                title: "MDN: How does the Internet work?",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "protocol",
          "Debugging by guessing at application behavior fails when the actual contract is in the header fields and state machine.",
          [
            "Wire format, field encoding and byte order",
            "Message sequence and state transitions",
            "Error signalling and version negotiation",
            "Interoperability through specifications, not implementations",
          ],
          "Compare an HTTP/1.1 request with a DNS query at the byte level using `tcpdump -X`, and list which fields carry length, type and transaction identity.",
          {
            summary:
              "A protocol is an agreed encoding and sequence of messages that lets independent implementations interoperate. The agreement covers field layout, state transitions and error behavior, which is why a single changed bit can turn a valid request into a reset.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Reading one implementation as the specification and copying its quirks.",
              "Ignoring version negotiation and assuming both peers speak the same revision.",
              "Confusing a protocol with the API or library that implements it.",
            ],
            resources: [
              {
                title: "Cloudflare: What is a network protocol?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-protocol/",
                kind: "article",
              },
              {
                title: "RFC 791: Internet Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc791.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "client-server-network",
          "Every troubleshooting trace starts with identifying which side initiated the conversation and which side owns the listening socket.",
          [
            "Listening socket, ephemeral client port and connection tuple",
            "Request-response versus long-lived connections",
            "Server state, session affinity and scaling limits",
            "Failover and the cost of a centralized listener",
          ],
          "Use `ss -ltnp` to find a local listener, connect with `curl -v`, and identify the client ephemeral port and the server port in both outputs.",
          {
            summary:
              "In a client-server exchange, the client initiates a request to a listening server, and the server replies on the same connection or a new one. The model concentrates state and policy at the server, which makes the listener a single point of failure and a single place to enforce access.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Assuming the server always closes the connection; HTTP keep-alive and TLS sessions keep it open.",
              "Scaling the server tier while leaving a single load balancer or database as the bottleneck.",
              "Confusing a client port with a service port when reading a packet capture.",
            ],
            resources: [
              {
                title: "MDN: Client-Server overview",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview",
                kind: "docs",
              },
              {
                title: "RFC 9110: HTTP Semantics",
                url: "https://www.rfc-editor.org/rfc/rfc9110.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "switching-and-lans",
      title: "Switching and LANs",
      description:
        "Follow an Ethernet frame through a switch: media, addressing, forwarding, loops and segmentation. You will build a small VLAN plan and explain exactly which table and which field decide where a frame goes.",
      topics: [
        topic(
          "transmission-media-types",
          "A link that negotiates at the wrong speed or duplex setting produces errors that look like application timeouts, not cable faults.",
          [
            "Cat 5e/6/6a twisted pair and the 100 m channel limit",
            "Single-mode versus multimode fiber and optical transceivers",
            "Duplex mismatch, autonegotiation and collision domains",
            "Shielding, crosstalk and electromagnetic interference",
          ],
          "Run `ethtool eth0` and `ip -s link show eth0`, record the negotiated speed, duplex and error counters, then compare with the cable category the link requires.",
          {
            summary:
              "Transmission media carry bits as electrical signals, light or radio, and each medium has its own distance, bandwidth and interference limits. Twisted pair, fiber and wireless differ less in speed than in noise immunity, duplex behavior and the failure modes they hide.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Forcing 1000/full on one side and leaving autonegotiation on the other, which creates a duplex mismatch.",
              "Using multimode fiber with a single-mode transceiver, or exceeding the reach budget for the optic.",
              "Reading CRC errors as a software problem before checking the cable, patch panel and transceiver.",
            ],
            resources: [
              {
                title: "IEEE 802.3: Ethernet working group",
                url: "https://www.ieee802.org/3/",
                kind: "docs",
              },
              {
                title: "Wireshark: Ethernet display filters",
                url: "https://www.wireshark.org/docs/dfref/e/eth.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "frame",
          "Frame size, FCS errors and tag handling explain failures that ping and application logs cannot see.",
          [
            "Destination and source MAC, EtherType and payload",
            "Frame check sequence and CRC error accounting",
            "Minimum and maximum frame size, MTU and jumbo frames",
            "802.1Q tag insertion and the 1522-byte tagged frame",
          ],
          "Capture one frame with `tcpdump -e -nn -c 1`, then write out each field, its byte length and the total frame size with and without a VLAN tag.",
          {
            summary:
              "An Ethernet frame wraps payload in a 14-byte header and a 4-byte frame check sequence, with a minimum payload of 46 bytes to reach the 64-byte minimum frame. VLAN tagging adds 4 bytes, and a frame larger than the egress MTU is dropped at the port or fragmented by the router.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Setting a 9000-byte MTU on one side of a path and leaving 1500 elsewhere, which silently drops large packets.",
              "Confusing the Ethernet FCS with an IP checksum; the FCS is checked and stripped by the NIC.",
              "Forgetting that a VLAN tag changes the frame size and the EtherType offset.",
            ],
            resources: [
              {
                title: "IEEE 802.3: Ethernet working group",
                url: "https://www.ieee802.org/3/",
                kind: "docs",
              },
              {
                title: "Wireshark: Ethernet display filters",
                url: "https://www.wireshark.org/docs/dfref/e/eth.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "mac-address",
          "Duplicate or spoofed MAC addresses, and a misunderstood multicast bit, break forwarding in ways that IP diagnostics never show.",
          [
            "48-bit address format, OUI and NIC-specific bits",
            "Unicast, multicast and broadcast at layer 2",
            "Locally administered addresses and virtualization",
            "MAC learning, aging and the forwarding table",
          ],
          "Read a local interface MAC with `ip link show`, decode the OUI and the I/G and U/L bits, then find the same address in `show mac address-table` on a switch.",
          {
            summary:
              "A MAC address is a 48-bit link-layer identifier, usually written as six hex octets, with the first 24 bits assigned as an OUI. The I/G bit marks multicast, the U/L bit marks locally administered addresses, and a switch learns the source address before it forwards the frame.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Treating a MAC address as permanent; virtual NICs, bonds and privacy features change it.",
              "Assuming a MAC address is globally unique when the same OUI is reused across virtual machines.",
              "Filtering on a multicast MAC without allowing the corresponding IP multicast group.",
            ],
            resources: [
              {
                title: "IEEE: OUI and company ID assignments",
                url: "https://standards.ieee.org/products-programs/regauth/oui/",
                kind: "docs",
              },
              {
                title: "IANA: IEEE 802 numbers",
                url: "https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml",
                kind: "docs",
              },
              {
                title: "Wireshark: Ethernet display filters",
                url: "https://www.wireshark.org/docs/dfref/e/eth.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "switches",
          "Most local outages come from forwarding-table mistakes, loops or a flooded VLAN, not from the router.",
          [
            "MAC learning, aging and content-addressable memory",
            "Unknown unicast flooding and broadcast domains",
            "Store-and-forward versus cut-through forwarding",
            "Port security, storm control and table exhaustion",
          ],
          "Clear a lab switch table, ping one host, then inspect `show mac address-table` and record which port learned which address and after how many frames.",
          {
            summary:
              "A switch learns source MAC addresses per port and forwards known unicast frames only to the port that owns the destination. Unknown unicast and broadcast frames flood to every port in the VLAN, so a loop can turn a quiet LAN into a broadcast storm and a full table turns unicast into flooding.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Cabling two access switches together twice without STP, creating a loop and a broadcast storm.",
              "Assuming a switch never floods; unknown unicast and broadcast always flood within the VLAN.",
              "Ignoring CAM table limits on access ports, which lets a spoofing host evict real entries.",
            ],
            resources: [
              {
                title: "Cloudflare: What is a network switch?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-network-switch/",
                kind: "article",
              },
              {
                title: "IEEE 802.1D: MAC Bridges",
                url: "https://www.ieee802.org/1/pages/802.1D.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "vlans",
          "A VLAN mismatch or native-VLAN mismatch silently leaks traffic between segments or drops it at the trunk.",
          [
            "802.1Q tag, PCP, DEI and 12-bit VLAN ID",
            "Access ports versus tagged trunk ports",
            "Native VLAN and untagged traffic on a trunk",
            "Inter-VLAN routing with a router or layer-3 switch",
          ],
          "Configure two VLANs and an 802.1Q trunk in a lab, then capture the trunk with `tcpdump -e -nn vlan` and label the tag on each frame.",
          {
            summary:
              "A VLAN is a logical broadcast domain carried across one or more switches, identified by a 12-bit 802.1Q tag that supports 4094 usable IDs. Access ports strip the tag, trunk ports carry it, and the native VLAN on a trunk is sent untagged unless configured otherwise.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Leaving the native VLAN as VLAN 1 on both ends and assuming it is unused.",
              "Forgetting to allow a new VLAN on the trunk, then debugging the host instead of the trunk.",
              "Treating a VLAN as a security boundary without filtering inter-VLAN traffic.",
            ],
            resources: [
              {
                title: "IEEE 802.1Q: Bridges and Bridged Networks",
                url: "https://www.ieee802.org/1/pages/802.1Q.html",
                kind: "docs",
              },
              {
                title: "Wireshark: VLAN display filters",
                url: "https://www.wireshark.org/docs/dfref/v/vlan.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "stp",
          "A redundant link that is not blocked by STP becomes a broadcast loop that saturates the LAN within seconds.",
          [
            "Bridge ID, root priority and root election",
            "Root path cost, port roles and port states",
            "BPDU timers, topology change notification and convergence",
            "RSTP and MSTP improvements over 802.1D",
          ],
          "In a lab with two switches and a redundant link, run `show spanning-tree` and record the root bridge, root port, blocked port and path cost before and after changing the priority.",
          {
            summary:
              "Spanning Tree Protocol elects one root bridge from the lowest bridge ID, then blocks redundant ports so the active topology is a loop-free tree. Ports move through blocking, listening, learning and forwarding, and a topology change can blackhole traffic for the length of the convergence timer.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Changing the root priority only on one switch and expecting the other side to move its blocked port immediately.",
              "Disabling STP on a port connected to a switch instead of enabling BPDU Guard on access ports.",
              "Mixing PVST+ and RSTP without mapping VLANs, which produces inconsistent topologies.",
            ],
            resources: [
              {
                title: "IEEE 802.1D: MAC Bridges",
                url: "https://www.ieee802.org/1/pages/802.1D.html",
                kind: "docs",
              },
              {
                title: "IEEE 802.1w: Rapid Reconfiguration",
                url: "https://www.ieee802.org/1/pages/802.1w.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "ip-addressing",
      title: "IP addressing and NAT",
      description:
        "Turn an address plan into a working subnet design. You will subnet, summarize, choose between IPv4 and IPv6, and explain where NAT helps and where it breaks end-to-end connectivity.",
      topics: [
        topic(
          "ip-address",
          "A wrong prefix length makes a host treat a remote address as local, so ARP or neighbor discovery fails before any route is consulted.",
          [
            "Interface address, prefix length and on-link determination",
            "Network and broadcast addresses in IPv4",
            "IPv6 global unicast, link-local and solicited-node multicast",
            "Address assignment: static, DHCP and SLAAC",
          ],
          "Run `ip -brief address` and `ip route get 8.8.8.8`, then compute whether each local address is on-link with the destination and which source address the kernel selected.",
          {
            summary:
              "An IP address identifies an interface, not a host, and is paired with a prefix length that defines the directly reachable network. IPv4 uses 32 bits and IPv6 uses 128 bits; in both cases the host sends locally when the destination is inside the prefix and to a router when it is outside.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Assigning 192.168.1.10/24 to a host that needs to reach 192.168.2.0/24 without a gateway.",
              "Using the network or broadcast address as a host address in IPv4.",
              "Forgetting that every IPv6 interface has a link-local address and needs a zone ID for some commands.",
            ],
            resources: [
              {
                title: "Cloudflare: What is the Internet Protocol?",
                url: "https://www.cloudflare.com/learning/network-layer/internet-protocol/",
                kind: "article",
              },
              {
                title: "RFC 791: Internet Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc791.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "ipv4-vs-ipv6",
          "Dual-stack networks fail when one family resolves but the other has no route, and the application reports only a timeout.",
          [
            "32-bit versus 128-bit addressing and header formats",
            "Broadcast versus multicast and anycast",
            "Neighbor discovery, SLAAC and router advertisements",
            "Dual stack, NAT64 and transition mechanisms",
          ],
          "Run `dig A example.com` and `dig AAAA example.com`, then test both families with `curl -4` and `curl -6` and record which path fails.",
          {
            summary:
              "IPv4 and IPv6 differ in address size, header design and how hosts discover neighbors and routers. IPv6 removes broadcast and in-path fragmentation, uses neighbor discovery over ICMPv6, and expects every LAN prefix to be a /64 for SLAAC.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Assuming IPv6 is IPv4 with longer addresses and missing neighbor discovery and RA configuration.",
              "Filtering ICMPv6 at the firewall, which breaks neighbor discovery, PMTU and SLAAC.",
              "Numbering a LAN with a prefix longer than /64 and breaking SLAAC and privacy addresses.",
            ],
            resources: [
              {
                title: "RFC 8200: Internet Protocol, Version 6",
                url: "https://www.rfc-editor.org/rfc/rfc8200.html",
                kind: "docs",
              },
              {
                title: "RFC 4291: IPv6 Addressing Architecture",
                url: "https://www.rfc-editor.org/rfc/rfc4291.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "subnetting",
          "An address plan with no growth room forces readdressing during an incident, when changing prefixes is most expensive.",
          [
            "Borrowed bits and the 2^n subnet count",
            "Usable host range and reserved addresses",
            "VLSM and right-sized prefixes per segment",
            "Route summarization and address-plan hierarchy",
          ],
          "Split 10.20.0.0/16 into a /22 for users, a /24 for voice, a /26 for management and a /30 for a transit link; list every network, range and broadcast address and verify with `ipcalc`.",
          {
            summary:
              "Subnetting borrows host bits to create multiple networks from one prefix, with each subnet reserving a network and broadcast address in IPv4. The design constraint is not arithmetic but growth: a subnet sized for today's hosts becomes a renumbering project when the next rack arrives.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Sizing every subnet as /24 and exhausting the parent prefix before the first expansion.",
              "Forgetting the two reserved addresses and assigning the broadcast address to a host.",
              "Using overlapping RFC 1918 ranges across sites and then trying to build a VPN between them.",
            ],
            resources: [
              {
                title: "RFC 950: Internet Standard Subnetting Procedure",
                url: "https://www.rfc-editor.org/rfc/rfc950.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is a subnet?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "subnet-masks",
          "A mask typo changes the on-link boundary without changing the address, so the host looks configured but cannot reach its gateway.",
          [
            "Contiguous mask bits and prefix notation",
            "Network, broadcast and usable range computation",
            "Wildcard masks in ACLs versus subnet masks",
            "Mask consistency across an Ethernet segment",
          ],
          "Take 172.16.34.75/27, compute the network, broadcast, first and last host by hand, then confirm with `ipcalc 172.16.34.75/27` and compare the binary mask.",
          {
            summary:
              "A subnet mask is a contiguous run of ones followed by zeros, and its length is the prefix that tells the host which bits are network and which are host. A non-contiguous mask is invalid in modern routing, and a mask mismatch between neighbors produces asymmetric reachability.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Writing a mask as 255.255.255.192 while the prefix says /26 and expecting the tools to agree.",
              "Confusing an ACL wildcard mask with a subnet mask; 0.0.0.255 means the opposite of /24.",
              "Configuring a /24 on one host and a /25 on its neighbor, splitting the broadcast domain.",
            ],
            resources: [
              {
                title: "RFC 950: Internet Standard Subnetting Procedure",
                url: "https://www.rfc-editor.org/rfc/rfc950.html",
                kind: "docs",
              },
              {
                title: "RFC 4632: CIDR and Aggregation",
                url: "https://www.rfc-editor.org/rfc/rfc4632.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "cidr",
          "Without CIDR aggregation, the global routing table would carry every customer prefix separately, and a bad summary can blackhole traffic.",
          [
            "Prefix length notation and classless allocation",
            "Route aggregation and longest-prefix match",
            "Provider-independent versus provider-assigned space",
            "Bogon and martian prefix filtering",
          ],
          "Aggregate 192.168.0.0/24 through 192.168.3.0/24 into one prefix with `ipcalc`, then explain why 192.168.0.0/22 is valid and 192.168.1.0/22 is not a summary of those four.",
          {
            summary:
              "CIDR replaces classful addressing with an explicit prefix length and allows routes to be aggregated across network boundaries. A provider can advertise one summary for many customers, and longest-prefix match decides which more specific route wins.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Summarizing prefixes that are not contiguous and accidentally advertising address space you do not own.",
              "Assuming a shorter prefix always wins; the longest matching prefix is selected first.",
              "Forgetting that a /31 is valid on point-to-point links and a /32 is a host route.",
            ],
            resources: [
              {
                title: "RFC 4632: CIDR and Aggregation",
                url: "https://www.rfc-editor.org/rfc/rfc4632.html",
                kind: "docs",
              },
              {
                title: "IANA: IPv4 address space",
                url: "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "nat-vs-pat",
          "NAT hides the internal topology but breaks protocols that embed addresses, and a full translation table looks like random packet loss.",
          [
            "Static NAT, dynamic NAT and PAT overload",
            "Translation table, timeouts and port exhaustion",
            "Address-dependent filtering and hairpinning",
            "Application-layer gateways for embedded addresses",
          ],
          "Capture traffic on both sides of a home router with `tcpdump -nn` while loading a page, then match the private tuple to the public tuple and record the translated source port.",
          {
            summary:
              "NAT rewrites the source or destination address at a translation boundary, and PAT multiplexes many private hosts onto one public address by rewriting source ports. The mapping is stateful: return traffic depends on the table entry, and inbound connections need an explicit static mapping or helper.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Assuming NAT is a firewall; it filters by accident, not by policy, and many NAT devices pass unsolicited inbound traffic with a static mapping.",
              "Running out of ports on a busy PAT address and blaming the upstream provider.",
              "Embedding a private IP in an application payload that NAT cannot rewrite.",
            ],
            resources: [
              {
                title: "RFC 3022: Traditional IP Network Address Translator",
                url: "https://www.rfc-editor.org/rfc/rfc3022.html",
                kind: "docs",
              },
              {
                title: "RFC 2663: NAT Terminology and Considerations",
                url: "https://www.rfc-editor.org/rfc/rfc2663.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "routing",
      title: "Routing",
      description:
        "Learn how a router chooses a path and how routing protocols exchange reachability. You will read a routing table, compare static and dynamic routing, and reason about convergence and failure domains.",
      topics: [
        topic(
          "routers",
          "A router with a correct route but a missing ARP entry or ACL drops traffic that the routing table says is reachable.",
          [
            "Control plane versus forwarding plane",
            "Longest-prefix lookup and next-hop resolution",
            "TTL decrement, PMTU and fragmentation behavior",
            "Routing protocols, static routes and policy",
          ],
          "On a Linux router, run `ip route show table all` and `ip neigh show`, then trace one packet with `traceroute` and identify which next hop resolved at each hop.",
          {
            summary:
              "A router receives a packet, strips the link header, looks up the destination in its forwarding table and rewrites the link header for the next hop. It decrements TTL, may fragment or signal PMTU, and keeps the control plane that learns routes separate from the data plane that forwards packets.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Reading the routing table as the full path; each hop makes an independent decision.",
              "Forgetting that a route needs a resolved next hop before traffic can be forwarded.",
              "Filtering ICMP on the router and breaking PMTU discovery for TCP.",
            ],
            resources: [
              {
                title: "Cloudflare: What is a router?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-router/",
                kind: "article",
              },
              {
                title: "RFC 1812: Requirements for IPv4 Routers",
                url: "https://www.rfc-editor.org/rfc/rfc1812.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "routing",
          "Two protocols can both know a destination, and without understanding preference the wrong path can silently win.",
          [
            "Connected, static and dynamic route sources",
            "Longest-prefix match and tie-breaking",
            "Administrative distance and protocol preference",
            "Convergence, blackholes and routing loops",
          ],
          "Add a static route that conflicts with a connected route, inspect `ip route get`, then remove it and document which route won and why.",
          {
            summary:
              "Routing is the process of building a forwarding table from connected, static and learned routes, then selecting the most specific match for each packet. Metrics compare paths within one protocol; administrative distance or preference compares routes from different sources.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Comparing metrics from different protocols as if they use the same scale.",
              "Redistributing routes in both directions without a filter, creating a feedback loop.",
              "Assuming convergence is instantaneous and sending traffic into a transient blackhole.",
            ],
            resources: [
              {
                title: "Cloudflare: What is routing?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-routing/",
                kind: "article",
              },
              {
                title: "RFC 1812: Requirements for IPv4 Routers",
                url: "https://www.rfc-editor.org/rfc/rfc1812.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "default-gateway",
          "A wrong gateway or a missing return route produces a one-way connection that looks like an application hang.",
          [
            "Default route as the least-specific match",
            "On-link next-hop requirement",
            "First-hop redundancy with VRRP or HSRP",
            "Proxy ARP and redirects as workarounds",
          ],
          "Run `ip route show default`, ping the gateway, then capture the first packet to an external address and confirm the destination MAC belongs to the gateway, not the remote host.",
          {
            summary:
              "A default gateway is the next hop used when no more specific route matches, represented as 0.0.0.0/0 in IPv4 and ::/0 in IPv6. The host must have the gateway on-link, and the gateway must have a return route to the host, or the first packet leaves but the reply never arrives.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Setting a gateway outside the host's prefix, which makes the next hop unreachable.",
              "Configuring the gateway on the host but not the return route on the router.",
              "Relying on proxy ARP instead of fixing the host's mask or default route.",
            ],
            resources: [
              {
                title: "Cloudflare: What is a router?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-router/",
                kind: "article",
              },
              {
                title: "RFC 1122: Requirements for Internet Hosts",
                url: "https://www.rfc-editor.org/rfc/rfc1122.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "static-vs-dynamic-routing",
          "A static default route cannot fail over on its own, and a dynamic protocol without filtering can advertise the wrong topology.",
          [
            "Static route scope, preference and redistribution",
            "Interior versus exterior routing protocols",
            "Failure detection, convergence and hold timers",
            "Operational cost of manual change control",
          ],
          "Build a two-router lab with a static route, break a link, record the outage, then replace it with OSPF and measure the time until the routing table reconverges.",
          {
            summary:
              "Static routes are fixed entries that change only when an operator changes them; dynamic protocols exchange reachability and recompute after a failure. Static routing is predictable and cheap at the edge, while dynamic routing is necessary wherever the topology changes without human notice.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using a static route to a next hop that is only reachable through the route being replaced, creating a recursive failure.",
              "Redistributing a static default route into OSPF without marking it external or filtering it.",
              "Assuming a dynamic protocol converges faster than the failure detection timer allows.",
            ],
            resources: [
              {
                title: "FRRouting: Static routes",
                url: "https://docs.frrouting.org/en/latest/static.html",
                kind: "docs",
              },
              {
                title: "FRRouting: OSPF",
                url: "https://docs.frrouting.org/en/latest/ospfd.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "ospf",
          "An OSPF area or MTU mismatch keeps neighbors from reaching FULL state, and the router quietly withdraws routes that the design assumed were redundant.",
          [
            "Link-state database, LSAs and Dijkstra shortest path",
            "Areas, ABRs and type 1/2/3 LSAs",
            "Hello, dead interval and neighbor state machine",
            "Interface cost, reference bandwidth and equal-cost paths",
          ],
          "In a three-router lab, run `show ip ospf neighbor` and `show ip ospf database`, change one interface cost, then confirm the route and next hop changed in `show ip route ospf`.",
          {
            summary:
              "OSPF is a link-state interior gateway protocol: routers flood link-state advertisements, build a synchronized topology database and run Dijkstra to choose the lowest-cost path. Areas bound the flooding domain, and the common default cost is reference bandwidth divided by interface bandwidth.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Mismatched hello or dead intervals on a broadcast segment, which leaves neighbors stuck in INIT or EXSTART.",
              "An MTU mismatch that lets neighbors reach EXSTART but not FULL because database description packets are dropped.",
              "Using a default reference bandwidth that makes every link cost 1 and erases path preference.",
            ],
            resources: [
              {
                title: "RFC 2328: OSPF Version 2",
                url: "https://www.rfc-editor.org/rfc/rfc2328.html",
                kind: "docs",
              },
              {
                title: "FRRouting: OSPF",
                url: "https://docs.frrouting.org/en/latest/ospfd.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "bgp",
          "A missing prefix filter or a leaked route can redirect a provider's traffic, and BGP has no automatic protection against a bad announcement.",
          [
            "eBGP, iBGP and route reflection",
            "AS_PATH, NEXT_HOP, LOCAL_PREF and MED",
            "Prefix filters, maximum-prefix and RPKI validation",
            "Best-path selection order and deterministic MED",
          ],
          "With two lab peers, advertise a prefix, inspect `show bgp ipv4 unicast`, then prepend the local AS twice and confirm the inbound path changes on the other router.",
          {
            summary:
              "BGP exchanges reachability between autonomous systems over TCP port 179, selecting paths by local preference, AS_PATH length, origin and MED, with tie-breakers down to router ID. It is a policy protocol, so the shortest AS_PATH is often not the path a provider wants you to take.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Advertising a more specific prefix by accident and attracting traffic for address space the AS does not own.",
              "Filtering by AS_PATH only and missing a route that arrives with an unexpected community.",
              "Forgetting `next-hop-self` on an iBGP speaker, leaving clients with an unreachable next hop.",
            ],
            resources: [
              {
                title: "RFC 4271: BGP-4",
                url: "https://www.rfc-editor.org/rfc/rfc4271.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is BGP?",
                url: "https://www.cloudflare.com/learning/security/glossary/what-is-bgp/",
                kind: "article",
              },
              {
                title: "RFC 1930: Guidelines for Creation of an AS",
                url: "https://www.rfc-editor.org/rfc/rfc1930.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "transport-and-services",
      title: "Transport and core services",
      description:
        "Move from packets to conversations: ports, sockets, reliable and unreliable transport, name resolution, address assignment and encrypted web traffic. You will capture and explain a full client-server exchange.",
      topics: [
        topic(
          "tcp",
          "Most application timeouts that look like server slowness are actually handshake failures, retransmissions or a zero window.",
          [
            "Three-way handshake and connection state machine",
            "Sequence, acknowledgment and cumulative ACK semantics",
            "Receive window, MSS and window scaling",
            "Retransmission timeout, fast retransmit and congestion control",
          ],
          "Capture a TCP connection with `tcpdump -nn 'tcp port 443'`, then label SYN, SYN-ACK, ACK, the first data segment and any retransmission with its relative sequence number.",
          {
            summary:
              "TCP turns an unreliable IP path into an ordered byte stream using a three-way handshake, sequence numbers, acknowledgments and retransmission timers. Flow control protects the receiver with a window; congestion control protects the path by adapting the sending rate to loss and delay.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Reading a RST as an application crash when it often means no listener or a firewall reject.",
              "Assuming a large receive window means high throughput without considering the bandwidth-delay product.",
              "Changing TCP settings without checking whether the loss is on the path or at the receiver.",
            ],
            resources: [
              {
                title: "RFC 9293: Transmission Control Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc9293.html",
                kind: "docs",
              },
              {
                title: "Wireshark: TCP display filters",
                url: "https://www.wireshark.org/docs/dfref/t/tcp.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "udp",
          "A UDP service that assumes IP delivers in order will corrupt state under normal packet reordering, not just during an outage.",
          [
            "8-byte UDP header and checksum coverage",
            "Connectionless datagrams and application-level reliability",
            "Port multiplexing and datagram boundaries",
            "IPv6 mandatory checksum and zero-checksum behavior",
          ],
          "Send ten datagrams with `nc -u`, capture them with `tcpdump -nn udp`, and record whether any arrived out of order or were dropped at the socket buffer.",
          {
            summary:
              "UDP adds an 8-byte header with source port, destination port, length and checksum to the IP payload, and provides no ordering or delivery guarantee. Applications that use it must add their own session identity, retransmission or forward error correction when the medium loses packets.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Treating UDP as reliable because it worked on localhost, where no packets are lost.",
              "Reading a datagram socket as a byte stream and losing message boundaries.",
              "Blocking on a single-threaded UDP loop and dropping packets while handling one request.",
            ],
            resources: [
              {
                title: "RFC 768: User Datagram Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc768.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is UDP?",
                url: "https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "port",
          "A port conflict or an ephemeral-range exhaustion produces bind failures and connection timeouts that look like network faults.",
          [
            "16-bit port space and IANA ranges",
            "Four-tuple connection identity",
            "Listening, established and time-wait sockets",
            "Ephemeral port selection and reuse",
          ],
          "Run `ss -tan` and `ss -lun`, classify each local port into its IANA range, and trace one connection from the client ephemeral port to the server listener.",
          {
            summary:
              "A port is a 16-bit identifier that selects a socket or service on a host, making the four-tuple of source address, source port, destination address and destination port unique. The 0-1023 range is reserved for well-known services, 49152-65535 is the dynamic range, and the middle range is registered.",
            difficulty: "core",
            minutes: 30,
            pitfalls: [
              "Assuming a service is reachable because the port is open on the host, while a firewall blocks it upstream.",
              "Binding a client to a fixed source port and colliding with the ephemeral range.",
              "Forgetting that TCP and UDP port spaces are separate and can carry different services on the same number.",
            ],
            resources: [
              {
                title: "IANA: Service name and port number registry",
                url: "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is a computer port?",
                url: "https://www.cloudflare.com/learning/network-layer/what-is-a-computer-port/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "socket",
          "A listener backlog, buffer or close pattern bug shows up as connection refused or reset, not as an application exception.",
          [
            "Socket, file descriptor and protocol control block",
            "bind, listen, accept and the accept queue",
            "Send and receive buffers and blocking behavior",
            "TIME_WAIT, SO_REUSEADDR and close semantics",
          ],
          "Write a 20-line Python TCP server with a listen backlog of 1, open 20 parallel clients, and record how many connections are refused or delayed.",
          {
            summary:
              "A socket is the kernel object behind a connection endpoint, identified by a file descriptor and bound to an address and port. The socket API exposes bind, listen, accept, connect and send; the kernel owns the buffers, timers and state that determine whether the application sees backpressure or a reset.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling listen with a backlog of 1 in a benchmark and measuring the backlog, not the server.",
              "Using SO_REUSEPORT without understanding that it load-balances connections across processes.",
              "Closing a socket with unread data and causing a reset instead of a clean FIN exchange.",
            ],
            resources: [
              {
                title: "Linux socket(7) manual page",
                url: "https://man7.org/linux/man-pages/man7/socket.7.html",
                kind: "docs",
              },
              {
                title: "Python: socket module",
                url: "https://docs.python.org/3/library/socket.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "dns",
          "A stale or missing record, or a resolver that cannot reach the authoritative server, looks like an application outage even when the service is healthy.",
          [
            "Recursive resolver versus authoritative nameserver",
            "Record types, CNAME chains and TTL caching",
            "Delegation, NS records and the root hints",
            "DNSSEC validation, DoT and DoH",
          ],
          "Run `dig +trace www.example.com`, then query a root server directly with `dig @a.root-servers.net . NS +norecurse` and compare the delegation chain with the TTL and answer sections.",
          {
            summary:
              "DNS resolves names through a hierarchy of authoritative servers, with a recursive resolver caching answers for their TTL. A query returns record types such as A, AAAA, CNAME, MX and TXT, and the resolver must follow delegations from the root to the authoritative zone.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Caching a negative answer without a short TTL and then waiting hours for a new record to appear.",
              "Pointing a CNAME at another CNAME or at an apex record that also needs MX or NS records.",
              "Testing only through one resolver and missing a delegation or DNSSEC failure visible elsewhere.",
            ],
            resources: [
              {
                title: "RFC 1034: Domain Names, Concepts and Facilities",
                url: "https://www.rfc-editor.org/rfc/rfc1034.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is DNS?",
                url: "https://www.cloudflare.com/learning/dns/what-is-dns/",
                kind: "article",
              },
              {
                title: "RFC 1035: Domain Names, Implementation and Specification",
                url: "https://www.rfc-editor.org/rfc/rfc1035.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "dhcp",
          "A failed relay or a scope with no free addresses leaves clients with an APIPA address and no route, while the DHCP server looks healthy.",
          [
            "DORA exchange and transaction identifiers",
            "Lease time, renewal timers and release",
            "DHCP relay agents and option 82",
            "Scope, reservations and options 3, 6 and 51",
          ],
          "Capture a DHCP exchange with `tcpdump -nn -i eth0 'udp port 67 or 68'`, then list the four messages, the offered address, the lease time and the router option.",
          {
            summary:
              "DHCP assigns addresses and options through the DORA exchange: Discover, Offer, Request and Acknowledge. The server leases an address for a fixed time, relay agents forward requests across subnets with the giaddr field, and the client must renew before the lease expires or fall back to a self-assigned address.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Running a second DHCP server on the same segment without coordination, causing duplicate leases.",
              "Forgetting the relay agent on a routed VLAN, so Discover never reaches the server.",
              "Setting a lease shorter than the client population can renew, which exhausts the scope during a storm.",
            ],
            resources: [
              {
                title: "RFC 2131: Dynamic Host Configuration Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc2131.html",
                kind: "docs",
              },
              {
                title: "RFC 2132: DHCP Options and BOOTP Extensions",
                url: "https://www.rfc-editor.org/rfc/rfc2132.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "web-and-encryption",
      title: "Web and encryption",
      description:
        "Understand the protocols that carry the application: HTTP semantics, TLS handshakes, certificate validation and the diagnostics that tell you which layer failed. You will inspect a real TLS connection and a real HTTP response.",
      topics: [
        topic(
          "http--https",
          "A status code, redirect chain or caching header explains more about a web failure than the application log does.",
          [
            "Methods, status codes and idempotence",
            "Headers, content negotiation and caching directives",
            "HTTP/1.1 keep-alive versus HTTP/2 multiplexing",
            "HTTP/3 over QUIC and connection migration",
          ],
          "Run `curl -v --http2 https://example.com`, then `curl -I` with and without `-H 'Accept-Encoding: gzip'` and record the status, cache headers and transfer encoding.",
          {
            summary:
              "HTTP is a request-response protocol with methods, status codes, headers and an optional body; HTTPS is HTTP carried inside TLS. HTTP/1.1 serializes requests per connection, HTTP/2 multiplexes streams over one connection, and HTTP/3 runs over QUIC to avoid TCP head-of-line blocking.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Treating a 301 as temporary and debugging the old URL, or caching a 302 that should not be cached.",
              "Assuming HTTP/2 is always faster; a single large response can still block a stream.",
              "Ignoring the Vary header and serving a compressed or localized response from a shared cache.",
            ],
            resources: [
              {
                title: "RFC 9110: HTTP Semantics",
                url: "https://www.rfc-editor.org/rfc/rfc9110.html",
                kind: "docs",
              },
              {
                title: "MDN: HTTP overview",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
                kind: "docs",
              },
              {
                title: "RFC 9112: HTTP/1.1",
                url: "https://www.rfc-editor.org/rfc/rfc9112.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "ssl--tls",
          "A certificate chain, SNI or protocol-version mismatch fails before HTTP is sent, so application logs show nothing useful.",
          [
            "ClientHello, ServerHello and key share",
            "Certificate chain, SANs and trust anchors",
            "TLS 1.3 cipher suites and forward secrecy",
            "SNI, ALPN and session resumption",
          ],
          "Run `openssl s_client -connect example.com:443 -servername example.com -tls1_3`, then record the negotiated protocol, cipher, certificate issuer and verification result.",
          {
            summary:
              "TLS authenticates the server with a certificate, negotiates a cipher suite and derives symmetric keys for confidentiality and integrity. TLS 1.3 reduces the handshake to one round trip, encrypts the certificate, and removes static RSA key exchange and legacy ciphers.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Trusting a certificate because the browser accepted it while the CLI uses a different trust store.",
              "Renewing a leaf certificate but forgetting the intermediate chain on the server.",
              "Disabling TLS 1.0/1.1 without checking an embedded client that still depends on them.",
            ],
            resources: [
              {
                title: "RFC 8446: TLS 1.3",
                url: "https://www.rfc-editor.org/rfc/rfc8446.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is Transport Layer Security?",
                url: "https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "icmp",
          "Blocking all ICMP breaks path MTU discovery and traceroute, producing blackholed large packets and misleading timeouts.",
          [
            "Type and code fields and message classes",
            "Echo request/reply versus error messages",
            "Fragmentation needed and PMTU discovery",
            "ICMPv6 neighbor discovery and router advertisements",
          ],
          "Capture `ping` with `tcpdump -nn icmp`, then use `nmap -PE` and compare the echo request type and code with the quoted IP header in any unreachable reply.",
          {
            summary:
              "ICMP carries control and error messages in IP, including echo request and reply, destination unreachable and time exceeded. It has no ports; the type and code fields carry the meaning, and the quoted original header tells the sender which flow triggered the error.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Blocking ICMP type 3 code 4 at a firewall and breaking PMTU for TCP.",
              "Rate-limiting all ICMP so aggressively that legitimate traceroute and error feedback disappears.",
              "Assuming a ping reply proves the application port is reachable.",
            ],
            resources: [
              {
                title: "RFC 792: Internet Control Message Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc792.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is ICMP?",
                url: "https://www.cloudflare.com/learning/ddos/glossary/internet-control-message-protocol-icmp/",
                kind: "article",
              },
              {
                title: "RFC 4443: ICMPv6",
                url: "https://www.rfc-editor.org/rfc/rfc4443.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "ping",
          "A clean ping is often used to close a ticket that is actually a TCP or DNS failure.",
          [
            "ICMP echo request/reply and identifier/sequence",
            "RTT, jitter and packet loss measurement",
            "TTL, DF bit and payload size",
            "Unprivileged ping sockets and permissions",
          ],
          "Run `ping -c 20 -s 1472 -M do 8.8.8.8`, record loss and RTT, then repeat with 1473 bytes and explain the failure using the 1500-byte MTU.",
          {
            summary:
              "Ping sends ICMP echo requests and reports round-trip time, loss and TTL for each reply. It tests reachability and basic path health, but a successful ping says nothing about TCP ports, TLS, DNS or application latency.",
            difficulty: "core",
            minutes: 25,
            pitfalls: [
              "Using the default 56-byte payload and concluding that the path supports 1500-byte packets.",
              "Comparing ping RTT to HTTP latency and ignoring DNS, TCP and TLS setup.",
              "Assuming ICMP is allowed on every path; many networks rate-limit or drop it.",
            ],
            resources: [
              {
                title: "Linux ping(8) manual page",
                url: "https://man7.org/linux/man-pages/man8/ping.8.html",
                kind: "docs",
              },
              {
                title: "RFC 792: Internet Control Message Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc792.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "traceroute--tracert",
          "A traceroute that stops at a firewall is often read as a network outage when the probe type, not the path, is blocked.",
          [
            "TTL/Hop Limit expiry and time-exceeded replies",
            "UDP, ICMP and TCP probe modes",
            "Per-hop RTT and asymmetric return paths",
            "Load balancing and multi-path ambiguity",
          ],
          "Run `traceroute -n -T -p 443 example.com` and `traceroute -n -I example.com`, then compare the hop lists and mark where the two probe types diverge.",
          {
            summary:
              "Traceroute discovers the forwarding path by sending probes with increasing TTL values and reading the time-exceeded replies from each hop. Linux defaults to UDP probes to high ports, Windows uses ICMP echo, and TCP probes can pass filters that block both.",
            difficulty: "core",
            minutes: 30,
            pitfalls: [
              "Treating a missing hop as a dead router; intermediate devices often rate-limit time-exceeded replies.",
              "Reading the final destination's RTT as application latency; it measures the probe, not the request.",
              "Assuming the displayed path is symmetric; return probes can take a different route.",
            ],
            resources: [
              {
                title: "Linux traceroute(8) manual page",
                url: "https://man7.org/linux/man-pages/man8/traceroute.8.html",
                kind: "docs",
              },
              {
                title: "Microsoft: tracert command",
                url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert",
                kind: "docs",
              },
              {
                title: "RFC 1393: Traceroute Using an IP Option",
                url: "https://www.rfc-editor.org/rfc/rfc1393.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "nslookup",
          "Resolution failures are frequently resolver-specific, and querying the wrong server hides a delegation or cache problem.",
          [
            "Default resolver versus explicit server selection",
            "Query types: A, AAAA, MX, TXT, NS, SOA",
            "Authoritative versus non-authoritative answers",
            "Debug output and timeout behavior",
          ],
          "Query the same name with `nslookup -type=MX example.com`, then against 1.1.1.1 and the zone's authoritative server, and record the TTL and authority differences.",
          {
            summary:
              "nslookup queries DNS servers interactively or in one-shot mode and prints the answer, authority and additional sections. It can select the record type and server, which makes it useful for comparing a local resolver with an authoritative server.",
            difficulty: "core",
            minutes: 25,
            pitfalls: [
              "Reading a non-authoritative answer as the zone's current state instead of a cached copy.",
              "Forgetting that nslookup may append a search domain and query a different name than intended.",
              "Using nslookup on a host with a broken resolver configuration and blaming the remote DNS server.",
            ],
            resources: [
              {
                title: "Microsoft: nslookup command",
                url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup",
                kind: "docs",
              },
              {
                title: "BIND 9: dig and nslookup manual pages",
                url: "https://bind9.readthedocs.io/en/latest/manpages.html",
                kind: "docs",
              },
              {
                title: "RFC 1034: Domain Names, Concepts and Facilities",
                url: "https://www.rfc-editor.org/rfc/rfc1034.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "wireless",
      title: "Wireless",
      description:
        "Design and troubleshoot Wi-Fi as a shared radio medium rather than a cable replacement. You will plan channels, place access points, choose security, and explain roaming and interference with measurements.",
      topics: [
        topic(
          "wireless-networking",
          "Treating Wi-Fi as a cable replacement leads to capacity plans that ignore interference, airtime and client density.",
          [
            "Shared medium, CSMA/CA and frame acknowledgment",
            "RSSI, SNR, noise floor and modulation",
            "Airtime, retries and co-channel interference",
            "2.4, 5 and 6 GHz band trade-offs",
          ],
          "Measure a laptop's RSSI and SNR at three distances with `iw dev wlan0 link`, then run an iperf3 throughput test at each point and plot the result.",
          {
            summary:
              "Wi-Fi is a shared half-duplex radio medium where clients contend for airtime with CSMA/CA and acknowledge unicast frames at layer 2. Throughput is governed by channel width, signal-to-noise ratio, airtime sharing and retries, not by the nominal PHY rate on the box.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Using RSSI alone as a quality metric; a strong signal with a high noise floor still yields low SNR.",
              "Counting the nominal PHY rate as usable throughput and ignoring airtime and retries.",
              "Placing an AP near a microwave or metal shelving and assuming the problem is the client.",
            ],
            resources: [
              {
                title: "IEEE 802.11: Wireless LAN working group",
                url: "https://www.ieee802.org/11/",
                kind: "docs",
              },
              {
                title: "Wireshark: WLAN display filters",
                url: "https://www.wireshark.org/docs/dfref/w/wlan.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "wifi-standards",
          "Buying an AP for a higher PHY rate without matching clients, channel width and backhaul wastes money and can increase interference.",
          [
            "802.11a/b/g/n/ac/ax/be PHY generations",
            "OFDMA, MU-MIMO and spatial streams",
            "Channel width, guard interval and modulation",
            "Wi-Fi 6E, 6 GHz and Wi-Fi 7 multi-link operation",
          ],
          "Inventory the wireless clients in one room with `iw dev wlan0 link` and `iw dev wlan0 station dump`, then map each negotiated rate and generation to the AP's configured standard.",
          {
            summary:
              "The IEEE 802.11 family defines PHY and MAC behavior, while Wi-Fi Alliance certifications name generations such as Wi-Fi 6 (802.11ax) and Wi-Fi 6E (6 GHz). Later standards add OFDMA, MU-MIMO, wider channels and target wake time, but each gain depends on client support and the band in use.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Enabling 160 MHz channels in a dense office and consuming most of the 5 GHz band for one AP.",
              "Assuming a Wi-Fi 6 AP gives Wi-Fi 6 benefits to 802.11ac clients.",
              "Confusing the marketing generation name with the IEEE amendment number.",
            ],
            resources: [
              {
                title: "IEEE 802.11: Wireless LAN working group",
                url: "https://www.ieee802.org/11/",
                kind: "docs",
              },
              {
                title: "Wi-Fi Alliance: Wi-Fi 6",
                url: "https://www.wi-fi.org/discover-wi-fi/wi-fi-6",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "access-points",
          "An AP with the wrong uplink VLAN, power budget or channel plan creates a coverage hole that looks like a client problem.",
          [
            "BSS, BSSID, SSID and the distribution system",
            "Local bridging versus tunneled CAPWAP mode",
            "PoE budget, uplink trunking and AP placement",
            "Beacon interval, DTIM and client power save",
          ],
          "Survey one room with `iw dev wlan0 scan`, record the BSSIDs, channels and signal levels, and identify which APs overlap at more than -70 dBm.",
          {
            summary:
              "An access point bridges wireless clients onto a wired distribution system, advertising SSIDs and enforcing the security policy for each BSS. In a controller-based design the AP tunnels traffic to a controller; in a local-mode design it bridges at the edge, which changes where policy and roaming state live.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Mounting an AP on a metal ceiling grid and measuring coverage from directly underneath only.",
              "Trunking the AP uplink without the management VLAN, leaving the AP unreachable after adoption.",
              "Using one SSID with mixed security modes, which lets a legacy client downgrade the whole WLAN.",
            ],
            resources: [
              {
                title: "IEEE 802.11: Wireless LAN working group",
                url: "https://www.ieee802.org/11/",
                kind: "docs",
              },
              {
                title: "Wireshark: WLAN display filters",
                url: "https://www.wireshark.org/docs/dfref/w/wlan.html",
                kind: "docs",
              },
              {
                title: "RFC 5415: CAPWAP Protocol Specification",
                url: "https://www.rfc-editor.org/rfc/rfc5415.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "controllers",
          "A controller outage can take down every AP it manages, and a misconfigured data path can blackhole client traffic even when the control channel is healthy.",
          [
            "CAPWAP control and data channels",
            "Centralized versus distributed forwarding",
            "RF profiles, AP groups and config push",
            "Controller redundancy and fast failover",
          ],
          "In a lab, capture CAPWAP control traffic with `tcpdump -nn 'udp port 5246 or udp port 5247'`, then map an AP join, configuration download and client association to the messages.",
          {
            summary:
              "A wireless controller centralizes AP configuration, RF management, roaming state and client authentication. CAPWAP carries control and data between APs and the controller, and the split between control and data paths determines whether client traffic is tunneled or locally bridged.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Tunneling all client traffic through a distant controller and adding latency to local traffic.",
              "Changing an RF profile during business hours without a rollback path for APs that lose management connectivity.",
              "Assuming controller failover preserves client sessions without testing reassociation.",
            ],
            resources: [
              {
                title: "RFC 5415: CAPWAP Protocol Specification",
                url: "https://www.rfc-editor.org/rfc/rfc5415.html",
                kind: "docs",
              },
              {
                title: "Cisco: What is a wireless LAN controller?",
                url: "https://www.cisco.com/site/us/en/learn/topics/networking/what-is-a-wireless-lan-controller.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "channel-planning",
          "Two nearby APs on the same channel halve available airtime, and a plan that ignores width can turn a clean band into a congested one.",
          [
            "Non-overlapping channels and co-channel reuse",
            "Channel width, edge channels and DFS",
            "Transmit power, cell size and roaming boundaries",
            "Site survey, noise floor and airtime utilization",
          ],
          "Run a passive survey with `iw dev wlan0 scan` at five points, list every BSSID, channel and width, and propose a 2.4 GHz plan using only 1, 6 and 11.",
          {
            summary:
              "Channel planning assigns non-overlapping channels and widths so that co-channel and adjacent-channel interference stay below the noise floor that the modulation can tolerate. In 2.4 GHz only channels 1, 6 and 11 are non-overlapping in North America; 5 GHz and 6 GHz offer many more channels but shorter range at wide widths.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Using 40 MHz channels in 2.4 GHz because the AP supports it, which overlaps every neighboring channel.",
              "Turning transmit power to maximum on every AP and creating a large interference footprint.",
              "Ignoring DFS radar events that vacate a 5 GHz channel and force clients to re-associate.",
            ],
            resources: [
              {
                title: "IEEE 802.11: Wireless LAN working group",
                url: "https://www.ieee802.org/11/",
                kind: "docs",
              },
              {
                title: "Wireshark: WLAN display filters",
                url: "https://www.wireshark.org/docs/dfref/w/wlan.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "wireless-security",
          "A PSK shared by every device, or WPA2 without management-frame protection, leaves the WLAN exposed to offline guessing and deauthentication attacks.",
          [
            "WPA2-CCMP, WPA3-SAE and protected management frames",
            "802.1X, EAP and the RADIUS authentication flow",
            "Pre-shared key versus enterprise identity",
            "Rogue APs, evil twins and deauthentication",
          ],
          "Capture a WPA2 four-way handshake with `tcpdump` or Wireshark, then explain which messages derive the PTK and why the PMK cannot be recovered from the capture alone.",
          {
            summary:
              "Wireless security combines link-layer encryption with authentication: WPA2 uses AES-CCMP and a pre-shared key or 802.1X, while WPA3 adds SAE and protected management frames. Enterprise mode delegates authentication to a RADIUS server through EAP, so the identity decision lives outside the AP.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Deploying WPA2-PSK with a short, shared password and no rotation plan.",
              "Enabling 802.1X without a fallback or test account, locking out guests and IoT devices.",
              "Disabling protected management frames and then treating deauth floods as client failures.",
            ],
            resources: [
              {
                title: "RFC 3748: Extensible Authentication Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc3748.html",
                kind: "docs",
              },
              {
                title: "RFC 5216: EAP-TLS Authentication Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc5216.html",
                kind: "docs",
              },
              {
                title: "Wi-Fi Alliance: Security",
                url: "https://www.wi-fi.org/discover-wi-fi/security",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "security-and-resilience",
      title: "Security and resilience",
      description:
        "Place controls where they actually see traffic: packet filters, stateful inspection, ACLs, VPNs and zero-trust identity. You will write a rule set, trace an allowed and a denied flow, and name the failure mode of each control.",
      topics: [
        topic(
          "firewalls",
          "A firewall that is bypassed by a second path or an overly broad allow rule provides false assurance without reducing exposure.",
          [
            "Default-deny policy and rule ordering",
            "Network, host and application-layer enforcement points",
            "NAT, routing and the firewall's own path",
            "Rule review, logging and change control",
          ],
          "Write a five-rule policy for a web tier, then trace one allowed and one denied flow through it and record the matching rule number for each.",
          {
            summary:
              "A firewall enforces an ordered policy at a boundary, comparing packets or flows against rules that permit, deny or log. The useful designs are default-deny with explicit exceptions; the hard part is placing the control where it sees the traffic and keeping the rule set reviewable.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Adding a broad allow rule to fix one flow and silently opening the whole subnet.",
              "Placing the firewall after NAT and losing the original source address in the logs.",
              "Forgetting asymmetric routing, which makes a stateful firewall drop valid return traffic.",
            ],
            resources: [
              {
                title: "NIST SP 800-41 Rev. 1: Firewalls and Firewall Policy",
                url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is a firewall?",
                url: "https://www.cloudflare.com/learning/security/what-is-a-firewall/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "packet-filtering",
          "Stateless rules that forget the return path are the most common cause of a policy that appears correct but passes no traffic.",
          [
            "Five-tuple matching and rule order",
            "Stateless ingress and egress rules",
            "Implicit deny and counters",
            "Filtering fragments, ICMP and established flows",
          ],
          "Write an nftables table that allows SSH from one /32 and drops everything else, then use `nft list ruleset` and `nft -s list ruleset` to show the compiled rule and counters.",
          {
            summary:
              "Packet filtering inspects each packet independently against fields such as source, destination, protocol and port. It is stateless by design: every direction needs its own rule, and a filter that permits the request but not the reply looks like a one-way failure.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Allowing the inbound request but not the outbound reply, then blaming the server.",
              "Filtering on a port number without the protocol, so UDP and TCP rules diverge unexpectedly.",
              "Dropping fragmented packets before the first fragment is evaluated, which breaks large UDP responses.",
            ],
            resources: [
              {
                title: "nftables wiki",
                url: "https://wiki.nftables.org/wiki-nftables/index.php/Main_Page",
                kind: "docs",
              },
              {
                title: "NIST SP 800-41 Rev. 1: Firewalls and Firewall Policy",
                url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "stateful-inspection",
          "A stateful firewall with a short timeout or an asymmetric path breaks long-lived sessions that a stateless rule would have passed.",
          [
            "Connection tracking table and flow state",
            "TCP flag validation and sequence checks",
            "Timeout tuning for idle and long-lived sessions",
            "Application-layer gateways and ALG behavior",
          ],
          "Inspect a Linux conntrack table with `conntrack -L` while an SSH session is idle, then wait past the timeout and record when the entry disappears and the session breaks.",
          {
            summary:
              "Stateful inspection keeps a connection table so a reply is allowed because it belongs to an established flow, not because a separate inbound rule exists. The state machine must handle TCP flags, timeouts, ICMP errors and protocols such as FTP that open secondary connections.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Treating a stateful rule as bidirectional for every protocol, including UDP and ICMP.",
              "Setting a timeout shorter than the application keepalive and dropping idle sessions.",
              "Assuming an ALG will fix an embedded address instead of testing the actual payload.",
            ],
            resources: [
              {
                title: "conntrack-tools manual",
                url: "https://conntrack-tools.netfilter.org/manual.html",
                kind: "docs",
              },
              {
                title: "NIST SP 800-41 Rev. 1: Firewalls and Firewall Policy",
                url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "acls",
          "An ACL placed on the wrong interface or direction can block management access or fail to filter the traffic it was written for.",
          [
            "Top-down evaluation and implicit deny",
            "Wildcard masks and address-bit matching",
            "Inbound versus outbound interface placement",
            "Logging, counters and rule hit analysis",
          ],
          "Write a numbered ACL that permits management from one /28, denies a guest /24, permits web traffic and logs the deny, then predict the hit count for three test flows before applying it.",
          {
            summary:
              "An ACL is an ordered list of permit and deny entries evaluated top to bottom, usually ending in an implicit deny. Wildcard masks match address bits, and the same list can filter traffic in one direction on one interface, so placement and direction are part of the rule's meaning.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Appending a permit after an implicit deny that already matched, so the new rule never fires.",
              "Using a subnet mask where a wildcard mask is required and matching the wrong address range.",
              "Applying an ACL inbound on a transit link and blocking the routing protocol adjacency.",
            ],
            resources: [
              {
                title: "RFC 8519: YANG Data Model for Network Access Control Lists",
                url: "https://www.rfc-editor.org/rfc/rfc8519.html",
                kind: "docs",
              },
              {
                title: "NIST SP 800-41 Rev. 1: Firewalls and Firewall Policy",
                url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "vpn",
          "A VPN that routes all traffic or uses mismatched proposals fails silently at phase 1 or phase 2, and the application only sees a timeout.",
          [
            "IPsec AH versus ESP and tunnel versus transport mode",
            "IKEv2, proposals and security associations",
            "Split tunnel, default route and traffic selection",
            "TLS VPNs and remote-access versus site-to-site",
          ],
          "Bring up an IPsec lab tunnel, capture the outer ESP with `tcpdump -nn esp`, then compare the outer addresses with the inner `ping` addresses and record the encapsulation overhead.",
          {
            summary:
              "A VPN creates an encrypted tunnel between endpoints, using IPsec ESP in tunnel mode or a TLS-based tunnel to protect traffic over an untrusted path. IKE negotiates the IPsec security association, and the tunnel endpoints become the effective source and destination for the inner packets.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Mismatched IKE proposals or pre-shared keys, which stall at phase 1 with no application-level clue.",
              "Overlapping private address ranges at both sites, which makes the tunnel route ambiguous.",
              "Routing all traffic through a distant hub and adding latency or breaking local internet access.",
            ],
            resources: [
              {
                title: "RFC 4301: Security Architecture for IP",
                url: "https://www.rfc-editor.org/rfc/rfc4301.html",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is a VPN?",
                url: "https://www.cloudflare.com/learning/security/what-is-a-vpn/",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "zero-trust-architecture",
          "A zero-trust design that only adds a VPN or an identity prompt while leaving flat internal access preserves the lateral movement it claims to remove.",
          [
            "Policy decision point and policy enforcement point",
            "Identity, device posture and continuous verification",
            "Microsegmentation and least-privilege access",
            "NIST 800-207 deployment models",
          ],
          "Write a one-page access policy for one internal app with subject, device, context and action, then test a request from an unmanaged device and record which policy check denies it.",
          {
            summary:
              "Zero trust replaces implicit trust in a network location with per-request verification of identity, device posture and context. A policy decision point evaluates the request and a policy enforcement point allows or denies it, which makes the identity provider and the enforcement layer part of the network path.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Buying a ZTNA product and calling the architecture zero trust without changing internal authorization.",
              "Requiring reauthentication so often that users work around the control.",
              "Treating device posture as a one-time check instead of a signal that expires.",
            ],
            resources: [
              {
                title: "NIST SP 800-207: Zero Trust Architecture",
                url: "https://csrc.nist.gov/pubs/sp/800/207/final",
                kind: "docs",
              },
              {
                title: "Cloudflare: What is Zero Trust?",
                url: "https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/",
                kind: "article",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "automation-and-cloud",
      title: "Automation and cloud",
      description:
        "Replace hand configuration with versioned, reviewable intent. You will model device data, push configuration with an automation tool, and map on-premises concepts onto a cloud virtual network without pretending they are identical.",
      topics: [
        topic(
          "network-automation",
          "A script that logs into ten devices and stops after the third leaves the network in a mixed state that is worse than no automation.",
          [
            "Declarative intent versus imperative commands",
            "Source of truth, inventory and credential handling",
            "Idempotency, dry run and rollback",
            "Change pipeline, validation and drift detection",
          ],
          "Write a playbook or script that reads a YAML inventory, renders one interface configuration, runs in check mode against a lab device, then applies it twice and proves the second run changes nothing.",
          {
            summary:
              "Network automation replaces hand edits with a versioned source of truth, templates and a repeatable apply step. The hard part is not the script but the contract: device inventory, credentials, idempotent intent and a rollback path when a change fails halfway.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Automating a manual command sequence without a pre-check, so a failed step leaves half the devices configured.",
              "Storing credentials in the repository or shell history instead of a secret store.",
              "Skipping the post-change validation and declaring success because the command exited zero.",
            ],
            resources: [
              {
                title: "Ansible: Network automation getting started",
                url: "https://docs.ansible.com/ansible/latest/network/getting_started/index.html",
                kind: "docs",
              },
              {
                title: "NAPALM documentation",
                url: "https://napalm.readthedocs.io/en/latest/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "python-for-networking",
          "A script without timeouts or error handling turns one unreachable device into a hung job and a stale configuration change.",
          [
            "ipaddress prefix arithmetic and validation",
            "socket timeouts, connect errors and partial reads",
            "Netmiko sessions and prompt handling",
            "Structured data, templates and idempotent output",
          ],
          "Write a Python script that reads a list of CIDRs, validates each with `ipaddress.ip_network`, lists overlapping pairs and exits non-zero when an overlap is found.",
          {
            summary:
              "Python is the common glue for network tooling: ipaddress calculates prefixes, socket opens connections, and libraries such as Netmiko or NAPALM drive devices over SSH or APIs. The useful skill is bounding the work with timeouts, retries and typed data instead of pasting commands into a loop.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Opening sockets without a timeout and hanging on a filtered port.",
              "Parsing CLI output with fixed character offsets instead of a grammar or a structured API.",
              "Catching every exception and printing success, which hides a failed device.",
            ],
            resources: [
              {
                title: "Python: ipaddress module",
                url: "https://docs.python.org/3/library/ipaddress.html",
                kind: "docs",
              },
              {
                title: "Python: socket module",
                url: "https://docs.python.org/3/library/socket.html",
                kind: "docs",
              },
              {
                title: "Netmiko repository",
                url: "https://github.com/ktbyers/netmiko",
                kind: "tool",
              },
            ],
          },
        ),
        topic(
          "netconf",
          "CLI scraping cannot tell you whether a change committed atomically, and NETCONF exposes the datastore state that makes rollback possible.",
          [
            "SSH transport, framing and hello capabilities",
            "Candidate, running and startup datastores",
            "edit-config, commit, validate and discard-changes",
            "Subtree filters and NETCONF notifications",
          ],
          "Use `ncclient` against a lab device to fetch the running configuration with a subtree filter, edit one description field in the candidate datastore and commit it, then discard a second change and show the running config is unchanged.",
          {
            summary:
              "NETCONF is a structured configuration protocol that runs over SSH, uses XML-encoded RPCs and separates candidate, running and startup datastores. Operations such as get-config, edit-config, commit and discard-changes make configuration transactional instead of a sequence of CLI commands.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Editing the running datastore directly and losing the ability to discard a partial change.",
              "Ignoring capabilities in the hello message and sending an operation the device does not support.",
              "Leaving a candidate lock held after a failed script, blocking every later operator.",
            ],
            resources: [
              {
                title: "RFC 6241: NETCONF Configuration Protocol",
                url: "https://www.rfc-editor.org/rfc/rfc6241.html",
                kind: "docs",
              },
              {
                title: "RFC 6242: NETCONF over SSH",
                url: "https://www.rfc-editor.org/rfc/rfc6242.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "yang",
          "Without a model, every automation script invents its own field names and cannot validate a change before it reaches the device.",
          [
            "Modules, containers, lists and leaf types",
            "Constraints: mandatory, must, when and unique",
            "Augmentation and model composition",
            "Tree output, instance data and validation",
          ],
          "Write a small YANG module with a container, a keyed list and a must constraint, validate it with `pyang`, then render the tree with `pyang -f tree`.",
          {
            summary:
              "YANG is a data modeling language that defines the structure, types and constraints of configuration and state exposed by NETCONF or RESTCONF. A model separates the schema from the encoding, so the same leaf can be carried in XML or JSON while validation stays tied to the model.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Treating YANG as a configuration template instead of a schema with constraints.",
              "Changing a key or type in a published module without a revision, breaking existing clients.",
              "Validating syntax only and missing semantic constraints that the device enforces on commit.",
            ],
            resources: [
              {
                title: "RFC 7950: YANG 1.1",
                url: "https://www.rfc-editor.org/rfc/rfc7950.html",
                kind: "docs",
              },
              {
                title: "pyang repository",
                url: "https://github.com/mbj4668/pyang",
                kind: "tool",
              },
            ],
          },
        ),
        topic(
          "ansible",
          "A playbook that works on servers but assumes a persistent shell fails on network devices, where each task opens a new session and facts are not guaranteed.",
          [
            "Inventory, groups and connection plugins",
            "Tasks, modules, handlers and idempotency",
            "network_cli, httpapi and vendor collections",
            "Check mode, diff mode and delegated facts",
          ],
          "Write a playbook that gathers interface facts from a lab device with `ansible.netcommon`, asserts one interface is up, and run it with `--check --diff` before applying.",
          {
            summary:
              "Ansible applies declarative tasks over SSH or API connections, using inventory, modules and playbooks to converge devices to a described state. Network modules usually run on the control node and talk to the device, so connection plugins, fact gathering and check mode behave differently from Linux hosts.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Using command or shell modules for configuration and losing idempotency and check mode.",
              "Assuming fact gathering works on a network device without the right facts module.",
              "Putting device credentials in inventory vars committed to git.",
            ],
            resources: [
              {
                title: "Ansible: Network automation getting started",
                url: "https://docs.ansible.com/ansible/latest/network/getting_started/index.html",
                kind: "docs",
              },
              {
                title: "Ansible: Playbook guide",
                url: "https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html",
                kind: "docs",
              },
              {
                title: "Ansible: ansible.netcommon collection",
                url: "https://docs.ansible.com/ansible/latest/collections/ansible/netcommon/index.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "cloud-networking-basics",
          "Lifting an on-premises address plan into a cloud VPC without checking reserved addresses, route tables and security-group state produces asymmetric or blocked paths.",
          [
            "VPC/VNet address space and subnet placement",
            "Route tables, internet and NAT gateways",
            "Security groups, NACLs and stateful filtering",
            "Peering, transit gateways and private connectivity",
          ],
          "Design a two-subnet VPC with a public and private subnet, then write the route table and security-group rules for one web and one database flow and mark which hop is stateful.",
          {
            summary:
              "Cloud networks are software-defined: a VPC or VNet provides an isolated address space, subnets are scoped to a region or availability zone depending on the provider, and route tables and security groups decide what can reach what. The constructs resemble on-premises VLANs and firewalls, but the provider owns the underlay and the control plane.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Overlapping CIDRs between a VPC and an on-premises network, which blocks peering and VPN routing.",
              "Assuming a security group is stateless and adding a separate inbound rule for return traffic.",
              "Putting a database in a public subnet because the private subnet had no NAT route for updates.",
            ],
            resources: [
              {
                title: "AWS: What is Amazon VPC?",
                url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
                kind: "docs",
              },
              {
                title: "Azure: Virtual network overview",
                url: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview",
                kind: "docs",
              },
              {
                title: "Google Cloud: VPC overview",
                url: "https://cloud.google.com/vpc/docs/vpc",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
