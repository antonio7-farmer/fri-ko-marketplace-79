import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
    value: File | string | null;
    onChange: (file: File | null) => void;
    label?: string;
    className?: string;
    height?: string;
    placeholder?: string;
}

const ImageUpload = ({
    value,
    onChange,
    label = "Fotografija",
    className = "",
    height = "h-48",
    placeholder = "Kliknite za upload slike"
}: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        if (!value) {
            setPreview(null);
            return;
        }

        if (typeof value === 'string') {
            setPreview(value);
        } else if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [value]);

    const processFile = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Datoteka je prevelika (max 5MB)');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Datoteka mora biti slika (JPG, PNG, WebP)');
            return;
        }

        onChange(file);
        toast.success('Slika je uspješno učitana!');
    };

    const fetchImageFromUrl = async (url: string) => {
        try {
            toast.info('Pokušavam preuzeti sliku...');
            const response = await fetch(url);
            const blob = await response.blob();

            if (!blob.type.startsWith('image/')) {
                throw new Error('URL ne vodi do slike');
            }

            const fileName = `image-${Date.now()}.${blob.type.split('/')[1]}`;
            const file = new File([blob], fileName, { type: blob.type });

            processFile(file);
        } catch {
            toast.error('Ne mogu preuzeti sliku s ove web stranice. Molimo spremite je na uređaj pa povucite datoteku.', {
                duration: 5000
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        // 1. Check for files (Drag from Desktop)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            return;
        }

        // 2. Check for URL (Drag from Web)
        const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (imageUrl) {
            if (imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || imageUrl.startsWith('http')) {
                await fetchImageFromUrl(imageUrl);
            }
            return;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-[#1F2937] mb-3">{label}</label>}

            <div
                className={`relative ${height} rounded-xl overflow-hidden bg-[#E8F5E9] border-2 border-dashed transition-all group cursor-pointer ${dragOver ? 'border-[#22C55E] bg-[#22C55E]/10 scale-[1.02]' : 'border-[#22C55E]'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover pointer-events-none"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                            }}
                        />

                        {/* Overlay Actions */}
                        <div className={`absolute inset-0 bg-black/40 ${dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none`}>
                            {dragOver ? (
                                <p className="text-white font-semibold">Ispustite sliku ovdje</p>
                            ) : (
                                <>
                                    <label className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer pointer-events-auto">
                                        Promijeni
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop propagation explicitly
                                            // We need to use a timeout/defer or handle it carefully because the label click might interfere
                                            // Actually simpler: just call onChange(null)
                                            // pointer-events-auto is needed
                                            onChange(null);
                                        }}
                                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors pointer-events-auto"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-[#E8F5E9]/50 transition-colors">
                        <Upload size={32} className={`text-[#22C55E] mb-2 ${dragOver ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[#6B7280] text-sm font-medium">
                            {dragOver ? 'Ispustite sliku ovdje!' : placeholder}
                        </span>
                        <span className="text-[#6B7280] text-xs mt-1">JPG, PNG (max 5MB)</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleChange}
                            className="hidden"
                        />
                    </label>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
