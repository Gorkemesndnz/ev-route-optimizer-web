import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import StopItem from './StopItem'

export default function StopList({ stops, setStops, onAddStop }) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setStops((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleRemove = (id) => {
        setStops(prev => prev.filter(s => s.id !== id))
    }

    return (
        <div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="stop-list">
                        {stops.map((stop, index) => (
                            <StopItem key={stop.id} stop={stop} index={index} total={stops.length} onRemove={handleRemove} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="stop-actions-row">
                <button className="add-stop-btn" onClick={onAddStop}>
                    <span>+</span> Durağa Ekle
                </button>
                <button className="add-stop-btn" style={{ color: 'var(--text-muted)' }}>
                    ••• Daha Fazla
                </button>
            </div>
        </div>
    )
}
