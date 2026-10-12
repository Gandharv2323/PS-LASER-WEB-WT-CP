# PS Laser – SRS Summary (v1.0)

Course: **CS3111 Web Technologies** · Proposed stack: React + Java Servlet + JSP + MySQL · Browser: Chrome

## Modules (from SRS section 4)
| ID  | Module | Status in this repo |
|-----|--------|---------------------|
| M01 | Public Website (home, services, portfolio, process, contact) | Implemented (React) |
| M02 | Authentication (register / login / logout, HTTP session) | Planned (Servlet + HttpSession) |
| M03 | Customer Management | Planned |
| M04 | Order Management | Planned |
| M05 | Production Management | Planned |
| M06 | Worker Management | Planned |
| M07 | Delivery Management | Planned |
| M08 | Payment Management | Planned |
| M09 | Notification Management | Planned |
| M10 | Reporting | Planned |
| M11 | Production Causal ETA | Planned |
| M12 | Deadline Recovery | Planned |
| M13 | Audit & Security | Planned |

## Roles
Customer, Worker, Supervisor, Manager, Owner, Administrator – authorization is enforced server-side.

## Novel feature
ETA = remaining_operation_time + queue_wait_time + downstream_operation_time + known_delay
Delta_ETA = ETA_current - ETA_baseline
Contribution(e) = ETA(S1) - ETA(S(-e))   (counterfactual with event e removed)
