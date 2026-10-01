using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;

namespace ERP_DL
{
    public class JO_DN_Numbering_DL
    {
        public List<JODN_NumberReset_DTO> JODN_NRList(DataTable Dt)
        {
            List<JODN_NumberReset_DTO> list = new List<JODN_NumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JODN_NumberReset_DTO
                {
                    JODN_NR_Number = Convert.ToInt64(dr["JODN_NR_Number"]),
                    JODN_NR_Date = Convert.ToString(dr["JODN_NR_Date"]),
                    JODN_NR_EndDate = Convert.ToString(dr["JODN_NR_EndDate"]),
                    JODN_NR_StartingNumber = Convert.ToString(dr["JODN_NR_StartingNumber"]),
                    JODN_NR_NumberofDigits = Convert.ToString(dr["JODN_NR_NumberofDigits"]),
                    JODN_NR_PrefilZero = Convert.ToString(dr["JODN_NR_PrefilZero"]),
                    JODN_NR_Frequency = Convert.ToString(dr["JODN_NR_Frequency"])
                });
            }
            return list;
        }

        public List<JODN_NumberPrefix_DTO> JODN_PrefixList(DataTable Dt)
        {
            List<JODN_NumberPrefix_DTO> list = new List<JODN_NumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JODN_NumberPrefix_DTO
                {
                    JODN_Prefix_Number = Convert.ToInt64(dr["JODN_Prefix_Number"]),
                    JODN_Prefix_Date = Convert.ToString(dr["JODN_Prefix_Date"]),
                    JODN_Prefix_EndDate = Convert.ToString(dr["JODN_Prefix_EndDate"]),
                    JODN_Prefix_Particulars = Convert.ToString(dr["JODN_Prefix_Particulars"])
                });
            }
            return list;
        }

        public List<JODN_NumberSuffix_DTO> JODN_SuffixList(DataTable Dt)
        {
            List<JODN_NumberSuffix_DTO> list = new List<JODN_NumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JODN_NumberSuffix_DTO
                {
                    JODN_Suffix_Number = Convert.ToInt64(dr["JODN_Suffix_Number"]),
                    JODN_Suffix_Date = Convert.ToString(dr["JODN_Suffix_Date"]),
                    JODN_Suffix_EndDate = Convert.ToString(dr["JODN_Suffix_EndDate"]),
                    JODN_Suffix_Particulars = Convert.ToString(dr["JODN_Suffix_Particulars"])
                });
            }
            return list;
        }
    }
}