using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace ERP_DL
{
    public class JOJWI_Numbering_DL
    {
        static string S(DataRow r, string c) =>
            r.Table.Columns.Contains(c) && r[c] != DBNull.Value ? Convert.ToString(r[c]) ?? "" : "";

        static long L(DataRow r, string c) =>
            r.Table.Columns.Contains(c) && r[c] != DBNull.Value ? Convert.ToInt64(r[c]) : 0;

        public List<JOJWI_NumberReset_DTO> JOJWI_NRSList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOJWI_NumberReset_DTO
            {
                JOJWI_NRS_Number = L(r, "JOJWI_NRS_Number"),
                JOJWI_NRS_StartDate = S(r, "JOJWI_NRS_StartDate"),
                JOJWI_NRS_EndDate = S(r, "JOJWI_NRS_EndDate"),
                JOJWI_NRS_StartingNumber = S(r, "JOJWI_NRS_StartingNumber"),
                JOJWI_NRS_NumberofDigits = S(r, "JOJWI_NRS_NumberofDigits"),
                JOJWI_NRS_PrefilZero = S(r, "JOJWI_NRS_PrefilZero"),
                JOJWI_NRS_Frequency = S(r, "JOJWI_NRS_Frequency"),
                JOJWI_NRS_IsDeleted = false
            }).ToList();
        }

        public List<JOJWI_NumberPrefix_DTO> JOJWI_PFXList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOJWI_NumberPrefix_DTO
            {
                JOJWI_PFX_Number = L(r, "JOJWI_PFX_Number"),
                JOJWI_PFX_StartDate = S(r, "JOJWI_PFX_StartDate"),
                JOJWI_PFX_EndDate = S(r, "JOJWI_PFX_EndDate"),
                JOJWI_PFX_Particulars = S(r, "JOJWI_PFX_Particulars"),
                JOJWI_PFX_IsDeleted = false
            }).ToList();
        }

        public List<JOJWI_NumberSuffix_DTO> JOJWI_SFXList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOJWI_NumberSuffix_DTO
            {
                JOJWI_SFX_Number = L(r, "JOJWI_SFX_Number"),
                JOJWI_SFX_StartDate = S(r, "JOJWI_SFX_StartDate"),
                JOJWI_SFX_EndDate = S(r, "JOJWI_SFX_EndDate"),
                JOJWI_SFX_Particulars = S(r, "JOJWI_SFX_Particulars"),
                JOJWI_SFX_IsDeleted = false
            }).ToList();
        }
    }
}