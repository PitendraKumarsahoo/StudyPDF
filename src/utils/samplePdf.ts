/**
 * Browser-side generator for an authentic multi-page study guide PDF.
 * Generates standard PDF-1.4 binary format with Type1 Helvetica fonts and selectable text streams.
 * Zero external libraries or network calls needed.
 */

function escapePdfText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

interface TextLine {
  text: string;
  isHeading?: boolean;
  isSubheading?: boolean;
  isCode?: boolean;
  isBullet?: boolean;
}

interface PageData {
  title: string;
  chapter: string;
  lines: TextLine[];
}

export function generateSamplePdfArrayBuffer(): ArrayBuffer {
  const pages: PageData[] = [
    {
      chapter: 'CHAPTER 1',
      title: 'Distributed Systems & ACID Semantics',
      lines: [
        { text: '1.1 Foundations of Distributed Computing', isHeading: true },
        { text: 'A distributed system consists of autonomous computing entities that communicate via networks to coordinate actions and achieve shared state. Unlike centralized systems, distributed architectures must navigate independent partial failures, asynchronous network latency, and non-deterministic clock drift.', isBullet: false },
        { text: '1.2 The CAP Theorem Trade-off', isHeading: true },
        { text: 'Eric Brewer proposed that a distributed data store can simultaneously provide at most two of the following three guarantees:', isBullet: false },
        { text: '• Consistency (C): Every read receives the most recent write or an explicit error.', isBullet: true },
        { text: '• Availability (A): Every non-failing node returns a reasonable response without timeout.', isBullet: true },
        { text: '• Partition Tolerance (P): The system continues functioning despite arbitrary network message loss.', isBullet: true },
        { text: 'Because network partitions are physically inevitable in real-world infrastructure, modern architectures must choose between CP (Consistency and Partition tolerance) or AP (Availability and Partition tolerance).', isBullet: false },
        { text: '1.3 ACID Guarantees in Transactional Workloads', isHeading: true },
        { text: '• Atomicity: All operations in the transaction succeed together, or the entire state aborts cleanly.', isBullet: true },
        { text: '• Consistency: State transitions preserve all database schemas, constraints, and relational invariants.', isBullet: true },
        { text: '• Isolation: Concurrent execution produces identical outcomes to serial execution ordering.', isBullet: true },
        { text: '• Durability: Once a transaction commits, its modifications survive unexpected system power crashes.', isBullet: true },
      ],
    },
    {
      chapter: 'CHAPTER 2',
      title: 'Relational Normalization & B-Tree Indexing',
      lines: [
        { text: '2.1 Principles of Schema Normalization', isHeading: true },
        { text: 'Database normalization is the formal process of structuring a relational database in accordance with progressive normal forms to minimize redundant storage and prevent update, insertion, and deletion anomalies.', isBullet: false },
        { text: '• First Normal Form (1NF): Attribute values must be atomic; repeating groups and nested relations are strictly eliminated.', isBullet: true },
        { text: '• Second Normal Form (2NF): Satisfies 1NF and guarantees that every non-key attribute is fully functionally dependent on the primary key.', isBullet: true },
        { text: '• Third Normal Form (3NF): Satisfies 2NF and removes all transitive functional dependencies across candidate attributes.', isBullet: true },
        { text: '• Boyce-Codd Normal Form (BCNF): A stricter variant of 3NF where every determinant must be a candidate key.', isBullet: true },
        { text: '2.2 Physical Storage & B+ Tree Anatomy', isHeading: true },
        { text: 'Most production relational engines (PostgreSQL, MySQL InnoDB) rely on B+ Trees for primary clustered indexing because of their logarithmic search guarantees and balanced height.', isBullet: false },
        { text: 'Key B+ Tree Characteristics:', isSubheading: true },
        { text: '1. All leaf nodes reside at the exact same depth level, guaranteeing deterministic O(log N) traversal.', isBullet: true },
        { text: '2. Internal nodes store only search keys and child pointers, maximizing fanout and minimizing disk page I/O reads.', isBullet: true },
        { text: '3. Leaf nodes are linked contiguously as a doubly-linked list, enabling high-throughput sequential range queries.', isBullet: true },
      ],
    },
    {
      chapter: 'CHAPTER 3',
      title: 'Memory Hierarchies & Cache Coherence',
      lines: [
        { text: '3.1 The Von Neumann Memory Hierarchy', isHeading: true },
        { text: 'Modern CPU microarchitectures utilize a tiered hierarchy to balance memory bandwidth, electrical latency, and hardware unit cost:', isBullet: false },
        { text: '• CPU Registers: Access latency under 1 nanosecond (single clock cycle).', isBullet: true },
        { text: '• Level 1 Cache (L1): Typically 32KB to 64KB per core, latency roughly 1 to 2 nanoseconds.', isBullet: true },
        { text: '• Level 2 Cache (L2): Dedicated per core, 512KB to 1MB, latency 4 to 8 nanoseconds.', isBullet: true },
        { text: '• Level 3 Cache (L3): Shared across multiple processor cores, 16MB to 64MB, latency 20 to 40 nanoseconds.', isBullet: true },
        { text: '• Main RAM (DDR5): 16GB to 128GB capacity, access latency between 50 and 100 nanoseconds.', isBullet: true },
        { text: '• NVMe SSD Storage: Solid state persistent pages, latency between 10 to 50 microseconds.', isBullet: true },
        { text: '3.2 The MESI Cache Coherence Protocol', isHeading: true },
        { text: 'In symmetric multiprocessing systems with private L1 caches, data consistency is maintained through the MESI state machine:', isBullet: false },
        { text: '• Modified (M): Line present only in current cache and dirty (inconsistent with main memory).', isBullet: true },
        { text: '• Exclusive (E): Line present only in current cache and clean (matches main memory).', isBullet: true },
        { text: '• Shared (S): Line may be replicated across multiple processor caches simultaneously.', isBullet: true },
        { text: '• Invalid (I): Line contents are obsolete and must be re-fetched across cache interconnect.', isBullet: true },
      ],
    },
    {
      chapter: 'CHAPTER 4',
      title: 'Concurrency Control & Deadlock Mitigation',
      lines: [
        { text: '4.1 Two-Phase Locking Protocol (2PL)', isHeading: true },
        { text: 'Two-Phase Locking ensures conflict serializability by requiring transactions to acquire and release locks in strict directional phases:', isBullet: false },
        { text: '1. Growing Phase: The transaction may acquire locks as needed but cannot release any lock.', isBullet: true },
        { text: '2. Shrinking Phase: The transaction may release acquired locks but cannot request any additional locks.', isBullet: true },
        { text: 'Under Strict 2PL (S2PL), all exclusive write locks must be held continuously until final transaction commit or rollback to eliminate cascading abort cascades.', isBullet: false },
        { text: '4.2 Deadlock Detection & Coffman Conditions', isHeading: true },
        { text: 'A deadlock state occurs if and only if all four Coffman conditions hold simultaneously:', isBullet: false },
        { text: '• Mutual Exclusion: Resources cannot be accessed concurrently by competing threads.', isBullet: true },
        { text: '• Hold and Wait: A process holds at least one resource while waiting for another assigned asset.', isBullet: true },
        { text: '• No Preemption: Resources cannot be forcibly expropriated; they must be voluntarily released.', isBullet: true },
        { text: '• Circular Wait: A closed loop exists where P1 waits for P2, P2 waits for P3, and Pn waits for P1.', isBullet: true },
        { text: 'Engineers mitigate deadlocks using timeout aborts, cycle detection in Wait-For Graphs (WFG), or strict global resource acquisition ordering.', isBullet: false },
      ],
    },
    {
      chapter: 'CHAPTER 5',
      title: 'Fault Tolerance & Raft Consensus Checklist',
      lines: [
        { text: '5.1 Raft Distributed Consensus Model', isHeading: true },
        { text: 'The Raft consensus algorithm decomposes replicated state machine management into three distinct formal problems:', isBullet: false },
        { text: '• Leader Election: When an existing leader heartbeat times out, followers transition to candidate and request randomized votes.', isBullet: true },
        { text: '• Log Replication: The designated leader accepts client commands, appends entries, and coordinates commit confirmations across a quorum majority.', isBullet: true },
        { text: '• Safety Guarantee: If a leader commits an entry at a given index and term, no competing server can overwrite that committed slot.', isBullet: true },
        { text: '5.2 High-Yield Exam Revision Checklist', isHeading: true },
        { text: '✓ Contrast Pessimistic vs Optimistic Concurrency Control (OCC) validation phases.', isBullet: true },
        { text: '✓ Calculate B+ Tree fanout given page size of 4096 bytes and 8-byte pointer keys.', isBullet: true },
        { text: '✓ Describe write-ahead logging (WAL) and how ARIES recovery uses redo/undo logs.', isBullet: true },
        { text: '✓ Explain why false sharing occurs in multithreaded code across distinct cache lines.', isBullet: true },
        { text: '✓ Verify quorum equations: R + W > N ensures strict read-your-writes consistency.', isBullet: true },
      ],
    },
  ];

  // Build PDF 1.4 syntax
  const objects: string[] = [];

  // obj 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // obj 2: Pages list (will fill kids)
  const pageObjIds: number[] = [];
  let currentObjId = 3;

  // We reserve obj 2 for Pages
  // Font obj
  const fontObjId = 3;
  objects.push(`${fontObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  
  const fontBoldObjId = 4;
  objects.push(`${fontBoldObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);

  currentObjId = 5;

  // For each page, create Content Stream obj and Page obj
  const pageEntries: { pageObjId: number; contentObjId: number }[] = [];

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const pageObjId = currentObjId++;
    const contentObjId = currentObjId++;
    pageObjIds.push(pageObjId);
    pageEntries.push({ pageObjId, contentObjId });

    // Build content stream instructions
    let stream = '';
    
    // Top banner decoration
    stream += '0.06 0.09 0.16 rg\n'; // dark slate
    stream += '40 735 532 2 re f\n'; // hairline divider

    // Chapter subtitle
    stream += 'BT\n';
    stream += `/F2 9 Tf\n`;
    stream += '0.4 0.45 0.55 rg\n';
    stream += `40 755 Td\n`;
    stream += `(${escapePdfText(p.chapter)}  ·  STUDYPDF WORKSPACE GUIDE) Tj\n`;
    stream += 'ET\n';

    // Page Title
    stream += 'BT\n';
    stream += `/F2 18 Tf\n`;
    stream += '0.06 0.09 0.16 rg\n';
    stream += `40 710 Td\n`;
    stream += `(${escapePdfText(p.title)}) Tj\n`;
    stream += 'ET\n';

    // Content lines
    let yPos = 670;
    for (const line of p.lines) {
      if (line.isHeading) {
        yPos -= 18;
        stream += 'BT\n';
        stream += `/F2 12 Tf\n`;
        stream += '0.12 0.16 0.24 rg\n';
        stream += `40 ${yPos} Td\n`;
        stream += `(${escapePdfText(line.text)}) Tj\n`;
        stream += 'ET\n';
        yPos -= 16;
      } else if (line.isSubheading) {
        yPos -= 12;
        stream += 'BT\n';
        stream += `/F2 10 Tf\n`;
        stream += '0.2 0.25 0.35 rg\n';
        stream += `40 ${yPos} Td\n`;
        stream += `(${escapePdfText(line.text)}) Tj\n`;
        stream += 'ET\n';
        yPos -= 14;
      } else {
        // Body text or bullet
        const indent = line.isBullet ? 52 : 40;
        const fontSize = 9.5;
        const maxCharsPerLine = line.isBullet ? 88 : 94;

        // Break line into words to wrap
        const words = line.text.split(' ');
        let currentLine = '';

        for (let w = 0; w < words.length; w++) {
          const testLine = currentLine ? `${currentLine} ${words[w]}` : words[w];
          if (testLine.length > maxCharsPerLine) {
            stream += 'BT\n';
            stream += `/F1 ${fontSize} Tf\n`;
            stream += '0.22 0.25 0.32 rg\n';
            stream += `${indent} ${yPos} Td\n`;
            stream += `(${escapePdfText(currentLine)}) Tj\n`;
            stream += 'ET\n';
            yPos -= 13;
            currentLine = words[w];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          stream += 'BT\n';
          stream += `/F1 ${fontSize} Tf\n`;
          stream += '0.22 0.25 0.32 rg\n';
          stream += `${indent} ${yPos} Td\n`;
          stream += `(${escapePdfText(currentLine)}) Tj\n`;
          stream += 'ET\n';
          yPos -= 14;
        }
        yPos -= 4;
      }
    }

    // Page footer
    stream += '0.85 0.88 0.92 rg\n';
    stream += '40 50 532 1 re f\n';
    stream += 'BT\n';
    stream += `/F1 9 Tf\n`;
    stream += '0.45 0.5 0.6 rg\n';
    stream += `40 34 Td\n`;
    stream += `(StudyPDF  ·  Confidential Academic Notes) Tj\n`;
    stream += 'ET\n';

    stream += 'BT\n';
    stream += `/F1 9 Tf\n`;
    stream += '0.45 0.5 0.6 rg\n';
    stream += `520 34 Td\n`;
    stream += `(Page ${i + 1} of ${pages.length}) Tj\n`;
    stream += 'ET\n';

    const streamLength = stream.length;

    // Content Object
    const contentObj = `${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj`;
    objects.push(contentObj);

    // Page Object
    const pageObj = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R /F2 ${fontBoldObjId} 0 R >> >> >>\nendobj`;
    objects.push(pageObj);
  }

  // Update obj 2 (Pages)
  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj`;
  // Put pagesObj at position 1 (second entry)
  objects.splice(1, 0, pagesObj);

  // Build raw PDF file
  let pdfOutput = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdfOutput.length);
    pdfOutput += obj + '\n';
  }

  const xrefOffset = pdfOutput.length;
  pdfOutput += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i].toString().padStart(10, '0');
    pdfOutput += `${off} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Convert to ArrayBuffer
  const buffer = new ArrayBuffer(pdfOutput.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < pdfOutput.length; i++) {
    view[i] = pdfOutput.charCodeAt(i) & 0xff;
  }

  return buffer;
}

/**
 * Converts raw plain text (from .txt, .md, etc.) into a multi-page PDF ArrayBuffer
 * so users can study any plain text or notes file directly in StudyPDF.
 */
export function generatePdfFromPlainText(rawText: string, docTitle: string): ArrayBuffer {
  const cleanTitle = docTitle.replace(/\.(txt|md|text|markdown)$/i, '') || 'Document';
  const rawLines = rawText.split(/\r?\n/);

  // Group into pages (~38 lines per page)
  const linesPerPage = 36;
  const pages: PageData[] = [];

  let currentLines: TextLine[] = [];
  let pageIndex = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trimEnd();

    if (!rawLine.trim()) {
      // Empty line spacer
      if (currentLines.length > 0) {
        currentLines.push({ text: ' ', isBullet: false });
      }
      continue;
    }

    const isHeading = rawLine.startsWith('# ') || /^[A-Z0-9\s.:-]{4,40}$/.test(rawLine.trim());
    const isSub = rawLine.startsWith('## ') || rawLine.startsWith('### ');
    const isBullet = rawLine.startsWith('• ') || rawLine.startsWith('- ') || rawLine.startsWith('* ') || /^\d+\.\s/.test(rawLine);

    let cleanText = rawLine.replace(/^#+\s*/, '');
    if (isBullet && !cleanText.startsWith('• ')) {
      cleanText = '• ' + cleanText.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
    }

    currentLines.push({
      text: cleanText,
      isHeading,
      isSubheading: isSub,
      isBullet,
    });

    if (currentLines.length >= linesPerPage) {
      pages.push({
        chapter: `SECTION ${pageIndex}`,
        title: pageIndex === 1 ? cleanTitle : `${cleanTitle} (Part ${pageIndex})`,
        lines: currentLines,
      });
      currentLines = [];
      pageIndex++;
    }
  }

  // Push remaining lines
  if (currentLines.length > 0 || pages.length === 0) {
    pages.push({
      chapter: `SECTION ${pageIndex}`,
      title: pageIndex === 1 ? cleanTitle : `${cleanTitle} (Part ${pageIndex})`,
      lines: currentLines.length > 0 ? currentLines : [{ text: 'Empty document.', isBullet: false }],
    });
  }

  // Generate PDF objects
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  const pageObjIds: number[] = [];
  let currentObjId = 3;

  const fontObjId = 3;
  objects.push(`${fontObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  const fontBoldObjId = 4;
  objects.push(`${fontBoldObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);

  currentObjId = 5;

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const pageObjId = currentObjId++;
    const contentObjId = currentObjId++;
    pageObjIds.push(pageObjId);

    let stream = '';
    // Divider
    stream += '0.06 0.09 0.16 rg\n';
    stream += '40 735 532 2 re f\n';

    // Header
    stream += 'BT\n/F2 9 Tf\n0.4 0.45 0.55 rg\n40 755 Td\n';
    stream += `(${escapePdfText(p.chapter)}  ·  ${escapePdfText(cleanTitle.toUpperCase())}) Tj\nET\n`;

    // Title
    stream += 'BT\n/F2 16 Tf\n0.06 0.09 0.16 rg\n40 710 Td\n';
    stream += `(${escapePdfText(p.title)}) Tj\nET\n`;

    let yPos = 675;
    for (const line of p.lines) {
      if (!line.text.trim()) {
        yPos -= 10;
        continue;
      }

      if (line.isHeading) {
        yPos -= 16;
        stream += 'BT\n/F2 12 Tf\n0.12 0.16 0.24 rg\n';
        stream += `40 ${yPos} Td\n(${escapePdfText(line.text)}) Tj\nET\n`;
        yPos -= 16;
      } else if (line.isSubheading) {
        yPos -= 12;
        stream += 'BT\n/F2 10 Tf\n0.2 0.25 0.35 rg\n';
        stream += `40 ${yPos} Td\n(${escapePdfText(line.text)}) Tj\nET\n`;
        yPos -= 14;
      } else {
        const indent = line.isBullet ? 52 : 40;
        const fontSize = 9.5;
        const maxChars = line.isBullet ? 88 : 94;

        const words = line.text.split(' ');
        let currentLine = '';

        for (let w = 0; w < words.length; w++) {
          const test = currentLine ? `${currentLine} ${words[w]}` : words[w];
          if (test.length > maxChars) {
            stream += 'BT\n';
            stream += `/F1 ${fontSize} Tf\n`;
            stream += '0.15 0.18 0.25 rg\n';
            stream += `${indent} ${yPos} Td\n`;
            stream += `(${escapePdfText(currentLine)}) Tj\nET\n`;
            yPos -= 13;
            currentLine = words[w];
          } else {
            currentLine = test;
          }
        }
        if (currentLine) {
          stream += 'BT\n';
          stream += `/F1 ${fontSize} Tf\n`;
          stream += '0.15 0.18 0.25 rg\n';
          stream += `${indent} ${yPos} Td\n`;
          stream += `(${escapePdfText(currentLine)}) Tj\nET\n`;
          yPos -= 14;
        }
        yPos -= 3;
      }

      if (yPos < 65) break; // Keep within printable page area
    }

    // Footer
    stream += '0.85 0.88 0.92 rg\n40 50 532 1 re f\n';
    stream += 'BT\n/F1 9 Tf\n0.45 0.5 0.6 rg\n40 34 Td\n(StudyPDF  ·  Academic Reader) Tj\nET\n';
    stream += `BT\n/F1 9 Tf\n0.45 0.5 0.6 rg\n520 34 Td\n(Page ${i + 1} of ${pages.length}) Tj\nET\n`;

    const streamLength = stream.length;
    objects.push(`${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj`);
    objects.push(`${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R /F2 ${fontBoldObjId} 0 R >> >> >>\nendobj`);
  }

  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj`;
  objects.splice(1, 0, pagesObj);

  let pdfOutput = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdfOutput.length);
    pdfOutput += obj + '\n';
  }

  const xrefOffset = pdfOutput.length;
  pdfOutput += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i].toString().padStart(10, '0');
    pdfOutput += `${off} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const buffer = new ArrayBuffer(pdfOutput.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < pdfOutput.length; i++) {
    view[i] = pdfOutput.charCodeAt(i) & 0xff;
  }

  return buffer;
}
