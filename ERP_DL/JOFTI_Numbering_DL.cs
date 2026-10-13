using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace ERP_DL
{
    public class JOFTI_Numbering_DL
    {
        static string S(DataRow r, string c) =>
            r.Table.Columns.Contains(c) && r[c] != DBNull.Value ? Convert.ToString(r[c]) ?? "" : "";

        static long L(DataRow r, string c) =>
            r.Table.Columns.Contains(c) && r[c] != DBNull.Value ? Convert.ToInt64(r[c]) : 0;

        public List<JOFTI_NumberReset_DTO> JOFTI_NRSList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOFTI_NumberReset_DTO
            {
                JOFTI_NRS_Number = L(r, "JOFTI_NRS_Number"),
                JOFTI_NRS_StartDate = S(r, "JOFTI_NRS_StartDate"),
                JOFTI_NRS_EndDate = S(r, "JOFTI_NRS_EndDate"),
                JOFTI_NRS_StartingNumber = S(r, "JOFTI_NRS_StartingNumber"),
                JOFTI_NRS_NumberofDigits = S(r, "JOFTI_NRS_NumberofDigits"),
                JOFTI_NRS_PrefilZero = S(r, "JOFTI_NRS_PrefilZero"),
                JOFTI_NRS_Frequency = S(r, "JOFTI_NRS_Frequency"),
                JOFTI_NRS_IsDeleted = false
            }).ToList();
        }

        public List<JOFTI_NumberPrefix_DTO> JOFTI_PFXList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOFTI_NumberPrefix_DTO
            {
                JOFTI_PFX_Number = L(r, "JOFTI_PFX_Number"),
                JOFTI_PFX_StartDate = S(r, "JOFTI_PFX_StartDate"),
                JOFTI_PFX_EndDate = S(r, "JOFTI_PFX_EndDate"),
                JOFTI_PFX_Particulars = S(r, "JOFTI_PFX_Particulars"),
                JOFTI_PFX_IsDeleted = false
            }).ToList();
        }

        public List<JOFTI_NumberSuffix_DTO> JOFTI_SFXList(DataTable dt)
        {
            return dt.AsEnumerable().Select(r => new JOFTI_NumberSuffix_DTO
            {
                JOFTI_SFX_Number = L(r, "JOFTI_SFX_Number"),
                JOFTI_SFX_StartDate = S(r, "JOFTI_SFX_StartDate"),
                JOFTI_SFX_EndDate = S(r, "JOFTI_SFX_EndDate"),
                JOFTI_SFX_Particulars = S(r, "JOFTI_SFX_Particulars"),
                JOFTI_SFX_IsDeleted = false
            }).ToList();
        }
    }
}