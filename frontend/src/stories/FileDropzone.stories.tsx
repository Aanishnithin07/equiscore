import React, { useState } from 'react';
import { FileDropzone } from '../components/ds/FileDropzone/FileDropzone';

export default {
  title: 'Components/FileDropzone',
  component: FileDropzone,
  parameters: { layout: 'padded' }
};

export const Interactive = () => {
  const [file, setFile] = useState<File | null>(null);
  
  return (
    <div className="w-[600px] max-w-full mx-auto mt-12 relative h-[500px]">
      <FileDropzone file={file} onSelect={setFile} />
    </div>
  );
};
