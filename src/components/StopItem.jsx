import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function StopItem({ stop, index, total, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const getDotClass = () => {
        if (index === 0) return 'start'
        if (index === total - 1) return 'end'
        return 'waypoint'
    }

    return (
        <div ref={setNodeRef} style={style} className={`stop-item ${isDragging ? 'dragging' : ''}`}>
            <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
            <span className={`stop-dot ${getDotClass()}`} />
            <span className="stop-name">{stop.name}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
                <button className="stop-action-btn" title="Ayarlar">⇅</button>
                {total > 2 && (
                    <button className="stop-action-btn" onClick={() => onRemove(stop.id)} title="Kaldır">✕</button>
                )}
            </div>
        </div>
    )
}
