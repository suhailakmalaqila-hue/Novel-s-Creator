import React, { useState, useRef } from 'react';
import {
  CharacterWiki,
  RoleTag,
  CharacterStatus,
  CustomAttribute,
  CharacterRelationship,
  Book,
} from '../../types';
import {
  X,
  User,
  Upload,
  Camera,
  Trash2,
  Plus,
  Sparkles,
  Link,
  Shield,
  Heart,
  Save,
  BookOpen,
} from 'lucide-react';

interface CharacterFormModalProps {
  isOpen: boolean;
  initialCharacter?: CharacterWiki | null;
  allCharacters: CharacterWiki[];
  books: Book[];
  onClose: () => void;
  onSave: (character: CharacterWiki) => void;
}

const ROLE_OPTIONS: RoleTag[] = [
  'Protagonis',
  'Antagonis',
  'Side',
  'Mentor',
  'Rival',
  'Netral',
];

const STATUS_OPTIONS: CharacterStatus[] = [
  'Hidup',
  'Mati',
  'Hilang',
  'Disegel',
  'Reinkarnasi',
  'Lainnya',
];

export const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  isOpen,
  initialCharacter,
  allCharacters,
  books,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(initialCharacter?.fullName || '');
  const [alias, setAlias] = useState(initialCharacter?.alias || '');
  const [age, setAge] = useState(initialCharacter?.age || '');
  const [gender, setGender] = useState(initialCharacter?.gender || '');
  const [roleTag, setRoleTag] = useState<RoleTag>(
    initialCharacter?.roleTag || 'Protagonis'
  );
  const [status, setStatus] = useState<CharacterStatus>(
    initialCharacter?.status || 'Hidup'
  );
  const [avatarUrl, setAvatarUrl] = useState(initialCharacter?.avatarUrl || '');

  // Deep Profile Fields
  const [physicalAppearance, setPhysicalAppearance] = useState(
    initialCharacter?.physicalAppearance || ''
  );
  const [personalityTraits, setPersonalityTraits] = useState(
    initialCharacter?.personalityTraits || ''
  );
  const [backstory, setBackstory] = useState(
    initialCharacter?.backstory || ''
  );
  const [motivation, setMotivation] = useState(
    initialCharacter?.motivation || ''
  );
  const [worldGoal, setWorldGoal] = useState(
    initialCharacter?.worldGoal || ''
  );

  // Dynamic Custom Attributes
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(
    initialCharacter?.customAttributes || []
  );

  // Relational Links
  const [relationships, setRelationships] = useState<CharacterRelationship[]>(
    initialCharacter?.relationships || []
  );

  // Book associations
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(
    initialCharacter?.bookIds || []
  );

  // Active form section tab
  const [activeTab, setActiveTab] = useState<'basic' | 'deep' | 'attributes' | 'relations'>('basic');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Avatar upload via FileReader base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom attributes handlers
  const handleAddAttribute = () => {
    setCustomAttributes([
      ...customAttributes,
      { id: 'attr_' + Date.now(), key: '', value: '' },
    ]);
  };

  const handleUpdateAttribute = (
    id: string,
    field: 'key' | 'value',
    val: string
  ) => {
    setCustomAttributes(
      customAttributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: val } : attr
      )
    );
  };

  const handleRemoveAttribute = (id: string) => {
    setCustomAttributes(customAttributes.filter((attr) => attr.id !== id));
  };

  // Relationship handlers
  const otherCharacters = allCharacters.filter(
    (c) => c.id !== initialCharacter?.id
  );

  const handleAddRelationship = () => {
    if (otherCharacters.length === 0) {
      setErrorMsg(
        'Belum ada karakter lain di wiki untuk dihubungkan. Buat karakter lain terlebih dahulu.'
      );
      return;
    }
    setRelationships([
      ...relationships,
      {
        id: 'rel_' + Date.now(),
        targetCharacterId: otherCharacters[0].id,
        relationType: 'Sahabat',
        description: '',
      },
    ]);
  };

  const handleUpdateRelationship = (
    id: string,
    field: keyof CharacterRelationship,
    val: string
  ) => {
    setRelationships(
      relationships.map((rel) =>
        rel.id === id ? { ...rel, [field]: val } : rel
      )
    );
  };

  const handleRemoveRelationship = (id: string) => {
    setRelationships(relationships.filter((rel) => rel.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Nama Lengkap karakter wajib diisi.');
      return;
    }

    const cleanedAttributes = customAttributes.filter(
      (a) => a.key.trim() || a.value.trim()
    );

    const characterData: CharacterWiki = {
      id: initialCharacter ? initialCharacter.id : 'char_' + Date.now(),
      fullName: fullName.trim(),
      alias: alias.trim(),
      age: age.trim(),
      gender: gender.trim(),
      roleTag,
      status,
      avatarUrl,
      physicalAppearance: physicalAppearance.trim(),
      personalityTraits: personalityTraits.trim(),
      backstory: backstory.trim(),
      motivation: motivation.trim(),
      worldGoal: worldGoal.trim(),
      customAttributes: cleanedAttributes,
      relationships,
      bookIds: selectedBookIds,
      createdAt: initialCharacter?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(characterData);
    onClose();
  };

  return (
    <div
      id="character-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                {initialCharacter
                  ? `Edit Profil: ${initialCharacter.fullName}`
                  : 'Tambah Karakter Wiki Baru'}
              </h3>
              <p className="text-xs text-[#9E9EB2]">
                Dokumentasikan data biologis, atribut kustom, latar belakang, dan jejaring relasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Section Navigation Tabs */}
        <div className="flex px-6 pt-2 bg-[#181826] border-b border-[#2A2A3C] gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'basic'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Data Dasar & Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deep')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'deep'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Fisik, Sifat & Masa Lalu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attributes')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attributes'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            <span>Atribut Kustom</span>
            <span className="px-1.5 py-0.2 bg-[#26263A] text-[10px] rounded-full font-mono">
              {customAttributes.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relations')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'relations'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            <span>Jejaring Relasi</span>
            <span className="px-1.5 py-0.2 bg-[#26263A] text-[10px] rounded-full font-mono">
              {relationships.length}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: BASIC DATA & AVATAR UPLOADER */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Photo Upload & Identity Card */}
              <div className="flex flex-col sm:flex-row gap-5 items-start p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                {/* Character Photo Container */}
                <div className="w-full sm:w-36 flex flex-col items-center shrink-0">
                  <div className="relative group w-32 h-36 rounded-xl border-2 border-dashed border-[#3A3A54] hover:border-[#D4AF37]/60 bg-[#1A1A28] overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 text-center text-[#6E6E85]">
                        <Camera className="w-7 h-7 mx-auto mb-1 text-[#D4AF37]/50" />
                        <span className="text-[10px] text-[#A0A0B5] block font-medium">
                          Unggah Foto
                        </span>
                        <span className="text-[8px] text-[#6E6E85] block">
                          JPG / PNG
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] transition-opacity cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
                      <span>{avatarUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="mt-2 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                {/* Primary Identity Fields */}
                <div className="flex-1 w-full space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Nama Lengkap Karakter <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Valerius Nightshade"
                        className="w-full px-3.5 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Nama Panggilan / Alias
                      </label>
                      <input
                        type="text"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Contoh: Val / Bayangan Merah"
                        className="w-full px-3.5 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Usia
                      </label>
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="24 tahun"
                        className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Gender / Jenis
                      </label>
                      <input
                        type="text"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="Pria / Wanita"
                        className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Peran Cerita (Role)
                      </label>
                      <select
                        value={roleTag}
                        onChange={(e) => setRoleTag(e.target.value as RoleTag)}
                        className="w-full px-2.5 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#E0E0E0] outline-none cursor-pointer"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                        Status Keberadaan
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CharacterStatus)}
                        className="w-full px-2.5 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#E0E0E0] outline-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Project Association */}
              {books.length > 0 && (
                <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-2">
                  <label className="block text-xs font-semibold text-[#FAF7EE] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    <span>Kaitkan dengan Proyek Buku Cerita (Opsional):</span>
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {books.map((b) => {
                      const isChecked = selectedBookIds.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedBookIds(selectedBookIds.filter((id) => id !== b.id));
                            } else {
                              setSelectedBookIds([...selectedBookIds, b.id]);
                            }
                          }}
                          className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#D4AF37] text-[#121212] font-semibold'
                              : 'bg-[#1E1E2E] text-[#9E9EB2] border border-[#2A2A3C]'
                          }`}
                        >
                          {b.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEEP PROFILE (FISIK, SIFAT, MASA LALU & GOALS) */}
          {activeTab === 'deep' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Deskripsi Fisik & Ciri Khas Tampilan
                </label>
                <textarea
                  value={physicalAppearance}
                  onChange={(e) => setPhysicalAppearance(e.target.value)}
                  rows={3}
                  placeholder="Warna rambut, mata, tinggi badan, pakaian khas, bekas luka, tato magis, postur tubuh..."
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Sifat, Kepribadian & Pola Perilaku (Traits)
                </label>
                <textarea
                  value={personalityTraits}
                  onChange={(e) => setPersonalityTraits(e.target.value)}
                  rows={3}
                  placeholder="Karakteristik kepribadian (misal: INTJ, dingin namun protektif, sinis terhadap bangsawan, humor kering)..."
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Latar Belakang Masa Lalu (Backstory)
                </label>
                <textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  rows={3}
                  placeholder="Asal-usul kelahiran, trauma masa kecil, peristiwa yang membentuk pandangan hidupnya..."
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                    Motivasi & Dorongan Batin
                  </label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    rows={2}
                    placeholder="Apa yang membuatnya terus berjuang setiap hari?"
                    className="w-full px-3.5 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                    Tujuan Akhir di Dunia Cerita (World Goal)
                  </label>
                  <textarea
                    value={worldGoal}
                    onChange={(e) => setWorldGoal(e.target.value)}
                    rows={2}
                    placeholder="Misi puncak yang ingin diraih di klimaks cerita..."
                    className="w-full px-3.5 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC CUSTOM ATTRIBUTES */}
          {activeTab === 'attributes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#FAF7EE]">
                    Atribut Kustom (Key - Value Pairs)
                  </h4>
                  <p className="text-[11px] text-[#8E8EA4]">
                    Tambahkan data khusus seperti Elemen Sihir, Senjata Khusus, Afiliasi Guild, Rank Kekuatan, MBTI, dll.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="py-1.5 px-3 bg-[#242438] hover:bg-[#30304C] text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Atribut</span>
                </button>
              </div>

              {customAttributes.length === 0 ? (
                <div className="py-8 px-4 text-center border border-dashed border-[#2A2A3C] rounded-xl bg-[#161624]">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-[#6E6E84]" />
                  <p className="text-xs text-[#8E8EA4]">
                    Belum ada atribut khusus. Klik "Tambah Atribut" untuk menambahkan parameter unik tokohmu!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customAttributes.map((attr, idx) => (
                    <div
                      key={attr.id || idx}
                      className="flex items-center gap-2 p-2.5 bg-[#161624] border border-[#2A2A3C] rounded-xl"
                    >
                      <input
                        type="text"
                        value={attr.key}
                        onChange={(e) =>
                          handleUpdateAttribute(attr.id, 'key', e.target.value)
                        }
                        placeholder="Nama Atribut (e.g. Elemen Sihir)"
                        className="w-1/3 px-3 py-1.5 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                      />
                      <span className="text-[#6E6E85]">:</span>
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) =>
                          handleUpdateAttribute(attr.id, 'value', e.target.value)
                        }
                        placeholder="Nilai Atribut (e.g. Api Kegelapan Peringkat S)"
                        className="flex-1 px-3 py-1.5 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(attr.id)}
                        className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Atribut"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELATIONAL LINKS */}
          {activeTab === 'relations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#FAF7EE]">
                    Jejaring Hubungan Antar Karakter
                  </h4>
                  <p className="text-[11px] text-[#8E8EA4]">
                    Hubungkan tokoh ini dengan tokoh lain di database wiki ceritamu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRelationship}
                  className="py-1.5 px-3 bg-[#242438] hover:bg-[#30304C] text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Relasi</span>
                </button>
              </div>

              {relationships.length === 0 ? (
                <div className="py-8 px-4 text-center border border-dashed border-[#2A2A3C] rounded-xl bg-[#161624]">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-[#6E6E84]" />
                  <p className="text-xs text-[#8E8EA4]">
                    Belum ada tautan relasi. Hubungkan tokoh ini dengan tokoh lain (Sahabat, Rival, Musuh, Pasangan) untuk memperkaya dinamika cerita.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {relationships.map((rel, idx) => (
                    <div
                      key={rel.id || idx}
                      className="p-3 bg-[#161624] border border-[#2A2A3C] rounded-xl space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="w-full sm:w-1/3">
                          <label className="block text-[10px] text-[#8E8EA4] mb-0.5">
                            Karakter Terhubung
                          </label>
                          <select
                            value={rel.targetCharacterId}
                            onChange={(e) =>
                              handleUpdateRelationship(
                                rel.id,
                                'targetCharacterId',
                                e.target.value
                              )
                            }
                            className="w-full px-2.5 py-1.5 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#FAF7EE] outline-none cursor-pointer"
                          >
                            {otherCharacters.map((oc) => (
                              <option key={oc.id} value={oc.id}>
                                {oc.fullName} ({oc.roleTag})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-1/3">
                          <label className="block text-[10px] text-[#8E8EA4] mb-0.5">
                            Jenis Relasi
                          </label>
                          <input
                            type="text"
                            value={rel.relationType}
                            onChange={(e) =>
                              handleUpdateRelationship(
                                rel.id,
                                'relationType',
                                e.target.value
                              )
                            }
                            placeholder="Sahabat / Rival / Musuh"
                            className="w-full px-2.5 py-1.5 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#FAF7EE] outline-none"
                          />
                        </div>

                        <div className="w-full sm:flex-1">
                          <label className="block text-[10px] text-[#8E8EA4] mb-0.5">
                            Catatan Hubungan
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={rel.description || ''}
                              onChange={(e) =>
                                handleUpdateRelationship(
                                  rel.id,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="Detail dinamika relasi..."
                              className="flex-1 px-2.5 py-1.5 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#FAF7EE] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveRelationship(rel.id)}
                              className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Relasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#181826] border-t border-[#2A2A3C]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-[#222234] hover:bg-[#2C2C42] text-xs font-semibold text-[#C0C0D4] rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            id="btn-submit-character"
            type="button"
            onClick={handleSubmit}
            className="py-2 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{initialCharacter ? 'Simpan Profil' : 'Simpan Karakter Wiki'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
