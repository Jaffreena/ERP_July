using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JO_Process_DL
    {
        // List (SP Id 2, Table 0)
        public List<JO_Process_DTO> JO_ProcessList(DataTable Dt)
        {
            List<JO_Process_DTO> JPRS_List = new List<JO_Process_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JPRS_List.Add(
                    new JO_Process_DTO
                    {
                        JPRS_Number = Convert.ToInt64(dr["JPRS_Number"]),
                        JPRS_ProcessName = Convert.ToString(dr["JPRS_ProcessName"]),
                        JPRS_Description = Convert.ToString(dr["JPRS_Description"]),

                        JPRS_Cons_UoM_Number = Convert.ToInt64(dr["JPRS_Cons_UoM_Number"]),
                        JPRS_Prod_UoM_Number = Convert.ToInt64(dr["JPRS_Prod_UoM_Number"]),
                        JPRS_Scrap_UoM_Number = Convert.ToInt64(dr["JPRS_Scrap_UoM_Number"]),
                        JPRS_Item_Number = Convert.ToInt64(dr["JPRS_Item_Number"]),
                        JPRS_SAC_Number = Convert.ToInt64(dr["JPRS_SAC_Number"]),

                        JPRS_ConsUoMName = Convert.ToString(dr["ConsUoMName"]),
                        JPRS_ProdUoMName = Convert.ToString(dr["ProdUoMName"]),
                        JPRS_ScrapUoMName = Convert.ToString(dr["ScrapUoMName"]),
                        JPRS_ScrapItemCode = Convert.ToString(dr["ScrapItemCode"]),
                        JPRS_SACCode = Convert.ToString(dr["SACCode"])
                    });
            }

            return JPRS_List;
        }

        // Edit (SP Id 4)
        public List<JO_Process_DTO> JO_ProcessEdit(DataTable Dt)
        {
            List<JO_Process_DTO> JPRS_List = new List<JO_Process_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JPRS_List.Add(
                    new JO_Process_DTO
                    {
                        JPRS_Number = Convert.ToInt64(dr["JPRS_Number"]),
                        JPRS_ProcessName = Convert.ToString(dr["JPRS_ProcessName"]),
                        JPRS_Description = Convert.ToString(dr["JPRS_Description"]),
                        JPRS_Cons_UoM_Number = Convert.ToInt64(dr["JPRS_Cons_UoM_Number"]),
                        JPRS_Prod_UoM_Number = Convert.ToInt64(dr["JPRS_Prod_UoM_Number"]),
                        JPRS_Scrap_UoM_Number = Convert.ToInt64(dr["JPRS_Scrap_UoM_Number"]),
                        JPRS_Item_Number = Convert.ToInt64(dr["JPRS_Item_Number"]),
                        JPRS_SAC_Number = Convert.ToInt64(dr["JPRS_SAC_Number"])
                    });
            }

            return JPRS_List;
        }
    }
}
