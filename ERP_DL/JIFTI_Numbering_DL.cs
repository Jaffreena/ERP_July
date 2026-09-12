using ERP_DTO.JobInwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JIFTI_Numbering_DL
    {
        public List<JIFTI_NumberReset_DTO> JIFTI_NRList(DataTable Dt)
        {
            List<JIFTI_NumberReset_DTO> JIFTI_NRList = new List<JIFTI_NumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIFTI_NRList.Add(
                    new JIFTI_NumberReset_DTO
                    {
                        JIFTI_NRS_Number = Convert.ToInt64(dr["JIFTI_NRS_Number"]),
                        JIFTI_NRS_StartDate = Convert.ToString(dr["JIFTI_NRS_StartDate"]),
                        JIFTI_NRS_EndDate = Convert.ToString(dr["JIFTI_NRS_EndDate"]),
                        JIFTI_NRS_StartingNumber = Convert.ToString(dr["JIFTI_NRS_StartingNumber"]),
                        JIFTI_NRS_NumberofDigits = Convert.ToString(dr["JIFTI_NRS_NumberofDigits"]),
                        JIFTI_NRS_PrefilZero = Convert.ToString(dr["JIFTI_NRS_PrefilZero"]),
                        JIFTI_NRS_Frequency = Convert.ToString(dr["JIFTI_NRS_Frequency"])
                    }
                );
            }

            return JIFTI_NRList;
        }

        public List<JIFTI_NumberPrefix_DTO> JIFTI_PrefixList(DataTable Dt)
        {
            List<JIFTI_NumberPrefix_DTO> JIFTI_PrefixList = new List<JIFTI_NumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIFTI_PrefixList.Add(
                    new JIFTI_NumberPrefix_DTO
                    {
                        JIFTI_PFX_Number = Convert.ToInt64(dr["JIFTI_PFX_Number"]),
                        JIFTI_PFX_StartDate = Convert.ToString(dr["JIFTI_PFX_StartDate"]),
                        JIFTI_PFX_EndDate = Convert.ToString(dr["JIFTI_PFX_EndDate"]),
                        JIFTI_PFX_Particulars = Convert.ToString(dr["JIFTI_PFX_Particulars"])
                    }
                );
            }

            return JIFTI_PrefixList;
        }

        public List<JIFTI_NumberSuffix_DTO> JIFTI_SuffixList(DataTable Dt)
        {
            List<JIFTI_NumberSuffix_DTO> JIFTI_SuffixList = new List<JIFTI_NumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIFTI_SuffixList.Add(
                    new JIFTI_NumberSuffix_DTO
                    {
                        JIFTI_SFX_Number = Convert.ToInt64(dr["JIFTI_SFX_Number"]),
                        JIFTI_SFX_StartDate = Convert.ToString(dr["JIFTI_SFX_StartDate"]),
                        JIFTI_SFX_EndDate = Convert.ToString(dr["JIFTI_SFX_EndDate"]),
                        JIFTI_SFX_Particulars = Convert.ToString(dr["JIFTI_SFX_Particulars"])
                    }
                );
            }

            return JIFTI_SuffixList;
        }
    }
}
