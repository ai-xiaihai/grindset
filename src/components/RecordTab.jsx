import LogForm from './LogForm'
import BACLogger from './BACLogger'

export default function RecordTab({ onAddEntry, onAddBac }) {
  return (
    <div className="tab-screen">
      <div className="page-header">
        <div className="page-header-title">Record</div>
        <div className="page-header-sub">Log your wellness activity</div>
      </div>

      <div className="tab-body">
        <LogForm onAdd={onAddEntry} />
        <BACLogger onAdd={onAddBac} />
      </div>
    </div>
  )
}
