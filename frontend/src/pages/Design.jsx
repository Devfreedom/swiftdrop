// Design-system review page. DEV ONLY — the route is registered only when
// import.meta.env.DEV is true, so production builds never link to it.
import { useState } from "react";
import {
  Bike, CreditCard, Mail, Package, Plus, Search, Trash2, Truck, User,
} from "lucide-react";
import { useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import Stepper from "../components/Stepper";
import DataTable from "../components/DataTable";
import ConfirmModal from "../components/ConfirmModal";
import {
  Button, Badge, Tabs, Dropdown, Modal, PageHeader,
  TextInput, SelectInput, TextareaInput,
} from "../ui";
import {
  CenterLoad, EmptyState, ErrorState, Skeleton, SkeletonList, Spinner,
} from "../components/Feedback";

const SWATCHES = [
  ["Brand", "var(--brand)", "#fff"], ["Brand hover", "var(--brand-hover)", "#fff"],
  ["Brand active", "var(--brand-active)", "#fff"], ["Success", "var(--success)", "#fff"],
  ["Success soft", "var(--success-soft)", "var(--success)"],
  ["Warning", "var(--warning)", "#fff"], ["Warning soft", "var(--warning-soft)", "var(--warning)"],
  ["Danger", "var(--danger)", "#fff"], ["Danger soft", "var(--danger-soft)", "var(--danger)"],
  ["Info", "var(--info)", "#fff"], ["Info soft", "var(--info-soft)", "var(--info)"],
  ["Ink", "var(--ink)", "#fff"], ["Body", "var(--body)", "#fff"], ["Muted", "var(--muted)", "#fff"],
];

const DEMO_ROWS = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  dest: ["Osu Oxford St", "Accra Mall", "East Legon", "Tema C25", "Dansoman"][i % 5],
  date: `2026-10-${String((i % 27) + 1).padStart(2, "0")}`,
  fee: 1200 + (i % 7) * 200,
  status: ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED"][i % 5],
  to: undefined,
}));

function Section({ title, children }) {
  return (
    <section className="design-section">
      <h3 className="eyebrow">{title}</h3>
      {children}
    </section>
  );
}

export default function Design() {
  const toast = useToast();
  const [tab, setTab] = useState("one");
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [dropMsg, setDropMsg] = useState("");

  return (
    <div className="design-wrap">
      <PageHeader
        title="Design system"
        sub="Every component and state. Dev only — not linked from the app."
        actions={<Badge tone="purple">DEV</Badge>}
      />

      <div className="card">
        <Section title="Color tokens (text pairs AA)">
          <div className="design-grid">
            {SWATCHES.map(([name, bg, fg]) => (
              <div key={name} className="row design-swatch">
                <span className="badge" style={{ background: bg, color: fg }}>{name}</span>
                <span className="muted small">{bg}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="card">
        <Section title="Typography">
          <h1>Heading 1 · 32px</h1>
          <h2>Heading 2 · 24px</h2>
          <h3>Heading 3 · 20px</h3>
          <p>Body 16px — request a pickup and follow it to the doorstep.</p>
          <p className="muted small">Small 14px muted — secondary notes and timestamps.</p>
          <span className="badge b-purple">Badge minimum 12px</span>
        </Section>
      </div>

      <div className="card">
        <Section title="Buttons">
          <div className="design-row">
            <Button variant="primary">Primary</Button>
            <Button>Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="design-row">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" iconOnly aria-label="Create delivery"><Plus size={16} /></Button>
          </div>
          <div className="design-row">
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="danger" disabled>Disabled danger</Button>
          </div>
        </Section>
      </div>

      <div className="card">
        <Section title="Fields">
          <div className="form grid2 design-form">
            <TextInput label="Default" placeholder="e.g. Ama Mensah" />
            <TextInput label="With icon + helper" icon={User} placeholder="Name"
              hint="Shown on the parcel label." />
            <TextInput label="Error state" icon={Mail} defaultValue="not-an-email"
              error="Enter a valid email address." />
            <TextInput label="Disabled" placeholder="Can't type here" disabled />
            <SelectInput label="Select" icon={Truck} defaultValue="bike">
              <option value="bike">Bike</option><option value="car">Car</option>
            </SelectInput>
            <TextareaInput label="Textarea" rows={3} placeholder="Parcel description…" />
          </div>
        </Section>
      </div>

      <div className="card">
        <Section title="Badges">
          <div className="design-row">
            {["PENDING", "CONFIRMED", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "CANCELLED",
              "SUCCESSFUL", "REFUNDED", "CASH", "TRANSFER", "OFFLINE"].map((s) => (
              <StatusBadge key={s} value={s} />
            ))}
          </div>
        </Section>
      </div>

      <div className="card">
        <Section title="Tabs + Dropdown">
          <Tabs
            tabs={[
              { id: "one", label: "Active" }, { id: "two", label: "History" },
              { id: "three", label: "Disabled", disabled: true },
            ]}
            value={tab} onChange={setTab} label="Demo tabs"
          />
          <p className="muted small">Selected: {tab} (arrow keys move, click selects)</p>
          <div className="design-row">
            <Dropdown
              label="Demo actions"
              trigger={<Button>Open menu ▾</Button>}
              items={[
                { id: "edit", label: "Edit", icon: User, onSelect: setDropMsg },
                { id: "pay", label: "Record payment", icon: CreditCard, onSelect: setDropMsg },
                { id: "del", label: "Delete", icon: Trash2, onSelect: setDropMsg },
                { id: "off", label: "Unavailable", disabled: true },
              ]}
            />
            {dropMsg && <span className="muted small">Picked: {dropMsg}</span>}
          </div>
        </Section>
      </div>

      <div className="card">
        <Section title="Modal + Toast">
          <div className="design-row">
            <Button variant="primary" onClick={() => setModal(true)}>Open modal</Button>
            <Button onClick={() => setConfirm(true)}>Confirm dialog</Button>
            <Button variant="ghost" onClick={() => toast.success("Saved — toast success.")}>Toast success</Button>
            <Button variant="ghost" onClick={() => toast.error("Failed — toast error.")}>Toast error</Button>
            <Button variant="ghost" onClick={() => toast.info("Heads up — toast info.")}>Toast info</Button>
          </div>
          <Modal
            open={modal} title="Example modal" onClose={() => setModal(false)}
            actions={<Button variant="primary" onClick={() => setModal(false)}>Done</Button>}
          >
            <p>Focus is trapped here. Escape or backdrop click closes it.</p>
            <TextInput label="Try tabbing" placeholder="Focus cycles inside" />
          </Modal>
          <ConfirmModal
            open={confirm} title="Delete this delivery?"
            message="This can't be undone." confirmLabel="Yes, delete"
            onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)}
          />
        </Section>
      </div>

      <div className="card">
        <Section title="Loading + empty + error">
          <div className="design-row"><Spinner dark /> <Spinner /> <span className="muted small">spinners</span></div>
          <CenterLoad text="Centered loader" />
          <Skeleton variant="text" />
          <Skeleton variant="block" />
          <SkeletonList rows={2} />
          <EmptyState icon={Package} title="Nothing here" hint="Empty state with action."
            actionTo="/design" actionLabel="Reload demo" />
          <ErrorState title="Delivery not found" hint="The server said 404."
            onRetry={() => toast.info("Retry clicked.")} />
        </Section>
      </div>

      <div className="card">
        <Section title="DataTable — search, sort, pagination, keyboard rows">
          <DataTable
            searchable searchLabel="Search demo rows"
            sortable pageSize={5}
            columns={[
              { key: "id", label: "ID" }, { key: "dest", label: "Destination" },
              { key: "date", label: "Date" }, { key: "fee", label: "Fee" },
              { key: "status", label: "Status" },
            ]}
            rows={DEMO_ROWS}
            render={(key, d) => {
              if (key === "status") return <StatusBadge value={d.status} />;
              if (key === "id") return <strong>DEL-{String(d.id).padStart(4, "0")}</strong>;
              return d[key];
            }}
            empty={<EmptyState icon={Search} title="No rows" hint="Try another search." />}
          />
        </Section>
      </div>

      <div className="card">
        <Section title="Stepper">
          <Stepper status="PENDING" />
          <Stepper status="IN_TRANSIT" />
          <Stepper status="DELIVERED" />
          <Stepper status="CANCELLED" />
        </Section>
      </div>

      <div className="card">
        <Section title="PageHeader + StatCard">
          <PageHeader title="Example header" sub="Subtitle plus actions."
            actions={<Button variant="primary" size="sm"><Plus size={14} /> New</Button>} />
          <div className="grid3">
            <StatCard icon={Package} value={128} label="deliveries" />
            <StatCard icon={Bike} value={12} label="riders" />
            <StatCard icon={Truck} value="₦48,200.00" label="revenue" to="/design" />
          </div>
        </Section>
      </div>
    </div>
  );
}
