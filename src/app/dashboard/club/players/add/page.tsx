'use client';
import SharedPlayerForm from '../../../shared/player-form/page';
import { useSearchParams } from 'next/navigation';

export default function AddClubPlayer() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const mode = editId ? 'edit' : 'add';

  return <SharedPlayerForm mode={mode} accountType="club" playerId={editId || undefined} />;
} 
