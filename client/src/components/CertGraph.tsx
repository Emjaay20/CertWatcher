import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

export interface CertData {
    id: string;
    subject: string;
    issuer: string;
    validTo: string;
    daysRemaining: number;
    next?: CertData;
}

export const CertGraph = ({ data }: { data: CertData }) => {
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let current: CertData | undefined = data;
        let index = 0;

        while (current) {
            // Position nodes vertically or horizontally
            // Let's go horizontal: Leaf -> Intermediate -> Root
            // Actually, standard is Root -> Intermediate -> Leaf.
            // But we receive Leaf first. So we can position Leaf at x=0, and parents at x=250, etc.
            // Or we can reverse the list first.

            // Let's just position them as we traverse (Leaf at bottom/right, Root at top/left)
            // Since 'next' is the Issuer (Parent), we are traversing up the tree.
            // Let's put Leaf at bottom (y=0), Parent at y=-150, etc.

            nodes.push({
                id: current.id,
                data: {
                    label: (
                        <div className="p-2 text-center">
                            <div className="font-bold text-xs">{current.subject.length > 30 ? current.subject.substring(0, 30) + '...' : current.subject}</div>
                            <div className="text-[10px] text-slate-400">{current.daysRemaining} days left</div>
                        </div>
                    )
                },
                position: { x: 0, y: -index * 150 },
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    width: 200,
                },
                type: 'default',
            });

            if (current.next) {
                edges.push({
                    id: `${current.id}-${current.next.id}`,
                    source: current.next.id, // Parent is source
                    target: current.id,      // Child is target
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#64748b' },
                    animated: true,
                });
            }

            current = current.next;
            index++;
        }

        return { nodes, edges };
    }, [data]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#334155" gap={16} />
                <Controls className="bg-surface border-slate-700 text-white" />
            </ReactFlow>
        </div>
    );
};
