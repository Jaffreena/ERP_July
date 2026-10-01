using ERP_DTO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JO_WorkCentre_DL
    {
        // List (SP Id 2, Table 0)
        public List<JO_WorkCentre_DTO> JO_WorkCentreList(DataTable Dt)
        {
            List<JO_WorkCentre_DTO> JWWC_List = new List<JO_WorkCentre_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JWWC_List.Add(
                    new JO_WorkCentre_DTO
                    {
                        JWWC_Number = Convert.ToInt64(dr["JWWC_Number"]),
                        JWWC_JW_WorkCentre = Convert.ToString(dr["JWWC_JW_WorkCentre"]),
                        JWWC_Description = Convert.ToString(dr["JWWC_Description"]),

                        JWWC_JWCG_Number = Convert.ToInt64(dr["JWWC_JWCG_Number"]),
                        JWWC_WH_Number = Convert.ToInt64(dr["JWWC_WH_Number"]),
                        JWWC_JPRS_Number = Convert.ToInt64(dr["JWWC_JPRS_Number"]),

                        JWWC_WorkCentreGroup = Convert.ToString(dr["JWCG_JW_WorkCentreGroup"]),
                        JWWC_WarehouseName = Convert.ToString(dr["WarehouseName"]),
                        JWWC_ProcessName = Convert.ToString(dr["ProcessName"])
                    });
            }

            return JWWC_List;
        }

        // Edit (SP Id 4)
        public List<JO_WorkCentre_DTO> JO_WorkCentreEdit(DataTable Dt)
        {
            List<JO_WorkCentre_DTO> JWWC_List = new List<JO_WorkCentre_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JWWC_List.Add(
                    new JO_WorkCentre_DTO
                    {
                        JWWC_Number = Convert.ToInt64(dr["JWWC_Number"]),
                        JWWC_JW_WorkCentre = Convert.ToString(dr["JWWC_JW_WorkCentre"]),
                        JWWC_Description = Convert.ToString(dr["JWWC_Description"]),
                        JWWC_JWCG_Number = Convert.ToInt64(dr["JWWC_JWCG_Number"]),
                        JWWC_WH_Number = Convert.ToInt64(dr["JWWC_WH_Number"]),
                        JWWC_JPRS_Number = Convert.ToInt64(dr["JWWC_JPRS_Number"])
                    });
            }

            return JWWC_List;
        }
    }
}
