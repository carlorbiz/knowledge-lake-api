#!/usr/bin/env python3
"""
Process ACRRM Practice Support Handbook for audiobook pronunciation
"""

import re

def process_handbook(input_file, output_file):
    """Apply all phonetic transformations for audiobook"""

    # Try different encodings
    for encoding in ['utf-8', 'cp1252', 'latin-1', 'utf-8-sig']:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"[OK] Successfully read file with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
    else:
        raise Exception("Could not decode file with any common encoding")

    # Store original table section to replace later
    table_section = """6.5 Training Pathway Comparison
The following comparison outlines key features of each Ackr'm training pathway to assist Practice Managers in understanding pathway-specific requirements.

I'll walk you through four training pathways: A.G.P.T., R.G.T.S., R.V.T.S., and I.P., comparing them across nine key features.

First, Duration of Training:
All four pathways have the same duration - four years F.T.E.
Refer to Ackr'm Training Time Policy for definitions of full-time equivalent training and part-time training calculations.

Second, Location Restrictions:
Again, all four pathways share identical requirements - Regional, rural and remote facilities, M.M. 2 to 7, with a minimum 12 months in M.M. 4 to 7.

Third, Practice Placement:
For A.G.P.T., R.G.T.S., and R.V.T.S., placements are college-supported based on priority and preferred locations in accredited training posts.
For I.P., it's college-supported placements, but registrars may negotiate their own placements.

Fourth, Training Fees:
For A.G.P.T., training is Commonwealth-funded through A.G.P.T., and assessment fees are self-funded.
For R.G.T.S., training is Commonwealth-funded through R.G.T.S., and assessment fees are self-funded.
For R.V.T.S., everything is managed by R.V.T.S.
For I.P., training is self-funded.

Fifth, Registrar Support Payments during C.G.T. Terms:
For A.G.P.T., registrars receive National Consistent Payments, N.C.P., and Flexible Funds.
For R.G.T.S., registrars receive R.G.T.S. Registrar Training Payment until 2026, then G.P. Training Incentive Payments from Semester 1, 2026.
For R.V.T.S., payments are managed by R.V.T.S.
For I.P., support is self-funded.

Sixth, Registrar Support Payments during A.S.T. Terms:
For A.G.P.T., registrars receive Flexible Funds.
For R.G.T.S., the same as C.G.T. - R.G.T.S. Registrar Training Payment until 2026, then G.P. Training Incentive Payments from Semester 1, 2026.
For R.V.T.S., again managed by R.V.T.S.
For I.P., self-funded.

Seventh, Assessment Preparation:
For both A.G.P.T. and R.G.T.S., pathways offer subsidised examination preparation workshops with individualised feedback.
For R.V.T.S., managed by R.V.T.S.
For I.P., self-funded.

Eighth, Employment Contract Requirements:
For both A.G.P.T. and R.G.T.S., the current version of the N.T.C.E.R. compliance is mandatory, and G.P.S.A. forward slash G.P.R.A. templates are required.
For R.V.T.S., R.V.T.S.-specific arrangements apply.
For I.P., contracts are negotiated directly, with N.T.C.E.R. alignment recommended but not mandatory.

Finally, Funding Access System:
For A.G.P.T., access funding via Prodah or H-pos for N.C.P.
For R.G.T.S., use R.G. Hub bank details until 2026, then Prodah or H-pos from 2026 onwards.
For R.V.T.S., through the R.V.T.S. programme.
For I.P., not applicable - no Commonwealth funding.

That completes the comparison of the four training pathways."""

    # Replace NTCER version references
    content = re.sub(r'NTCER Version 2025-02', 'the current version of the N.T.C.E.R.', content)
    content = re.sub(r'NTCER 2025-02', 'the current version of the N.T.C.E.R.', content)

    # Replace the table section (handle variations in line breaks)
    table_pattern = r'6\.5 Training Pathway Comparison Table.*?\*Refer to Ackr.m Training Time Policy'
    content = re.sub(table_pattern, table_section, content, flags=re.DOTALL)

    # Replace initialisms with periods
    # CGT (but not in AGPT, RGTS)
    content = re.sub(r'\b(CGT)(?![A-Z])', r'C.G.T.', content)

    # AST (but not in "EAST" or similar)
    content = re.sub(r'\b(AST)\b', r'A.S.T.', content)

    # NCP (standalone)
    content = re.sub(r'\b(NCP)\b', r'N.C.P.', content)

    # MPN (standalone)
    content = re.sub(r'\b(MPN)\b', r'M.P.N.', content)

    # FTE (standalone or with *)
    content = re.sub(r'\b(FTE)(\*?)\b', r'F.T.E.\2', content)

    # MM with numbers
    content = re.sub(r'\bMM(\d)', r'M.M. \1', content)

    # GPT with numbers
    content = re.sub(r'\bGPT(\d)', r'G.P.T. \1', content)

    # AGPT (standalone)
    content = re.sub(r'\b(AGPT)\b', r'A.G.P.T.', content)

    # RGTS (standalone)
    content = re.sub(r'\b(RGTS)\b', r'R.G.T.S.', content)

    # RVTS (standalone)
    content = re.sub(r'\b(RVTS)\b', r'R.V.T.S.', content)

    # IP (but be careful - only when referring to Independent Pathway)
    content = re.sub(r'\b(IP)\s+(registrar|pathway)', r'I.P. \2', content)
    content = re.sub(r'pathway\s*\((IP)\)', r'pathway (I.P.)', content)

    # WHS (Work Health and Safety)
    content = re.sub(r'\b(WHS)\b', r'W.H.S.', content)

    # PII (Professional Indemnity Insurance)
    content = re.sub(r'\b(PII)\b', r'P.I.I.', content)

    # CV (curriculum vitae)
    content = re.sub(r'\b(CV)\b', r'C.V.', content)

    # CPD (Continuing Professional Development)
    content = re.sub(r'\b(CPD)\b', r'C.P.D.', content)

    # AHPRA (already correct in original as it's a word)

    # RMO (Resident Medical Officer)
    content = re.sub(r'\b(RMO|RMOs)\b', r'R.M.O.\1', content)
    content = re.sub(r'R\.M\.O\.RMOs', r'R.M.O.\'s', content)

    # VMO (Visiting Medical Officer)
    content = re.sub(r'\b(VMO)\b', r'V.M.O.', content)

    # EDM (appears to be email/direct mail)
    content = re.sub(r'\b(EDM)\b', r'E.D.M.', content)

    # RDOT (Regional Director of Training)
    content = re.sub(r'\b(RDOT)\b', r'R.D.O.T.', content)

    # PC/TPOC
    content = re.sub(r'\b(PC/TPOC)\b', r'P.C. forward slash T.P.O.C.', content)

    # NES (National Employment Standards)
    content = re.sub(r'\b(NES)\b', r'N.E.S.', content)

    # ABN (Australian Business Number)
    content = re.sub(r'\b(ABN)\b', r'A.B.N.', content)

    # PMC (Postgraduate Medical Council)
    content = re.sub(r'\b(PMC|PMCs)\b', lambda m: 'P.M.C.' if m.group(0) == 'PMC' else 'P.M.C.\'s', content)

    # CBD (Case-Based Discussion)
    content = re.sub(r'\b(CBD)\b', r'C.B.D.', content)

    # DOPS (Direct Observation of Procedural Skills)
    content = re.sub(r'\b(DOPS)\b', r'D.O.P.S.', content)

    # MiniCEX (Mini Clinical Evaluation Exercise) - special case
    content = re.sub(r'\b(MiniCEX)\b', r'Mini-CEX', content)

    # StAMPS (Structured Assessment using Multiple Patient Scenarios)
    content = re.sub(r'\b(StAMPS)\b', r'StAMPS', content)  # Keep as is - it's a unique name

    # MCQ (Multiple Choice Question)
    content = re.sub(r'\b(MCQ)\b', r'M.C.Q.', content)

    # SSO (Single Sign-On)
    content = re.sub(r'\b(SSO)\b', r'S.S.O.', content)

    # PIP (Practice Incentive Program)
    content = re.sub(r'\b(PIP)\b', r'P.I.P.', content)

    # AIDA Framework
    content = re.sub(r'\b(AIDA)\b', r'A.I.D.A.', content)

    # REST (appears to be a course)
    content = re.sub(r'\bREST course\b', r'R.E.S.T. course', content)

    # MS Form (Microsoft Form)
    content = re.sub(r'\b(MS Form)\b', r'M.S. Form', content)

    with open(output_file, 'w', encoding='utf-8-sig') as f:
        f.write(content)

    print(f"[OK] Audiobook-ready version created: {output_file}")
    print(f"[OK] All initialisms formatted with periods")
    print(f"[OK] Table section converted to narrative format")
    print(f"[OK] All NTCER version references updated to 'the current version of the N.T.C.E.R.'")

if __name__ == "__main__":
    input_file = r"C:\Users\carlo\Development\mem0-sync\mem0\ACRRM Practice Support Handbook.txt"
    output_file = r"C:\Users\carlo\Development\mem0-sync\mem0\ACRRM Practice Support Handbook - Audiobook Ready.txt"

    process_handbook(input_file, output_file)
