using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_Shift_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JO_ShiftDB(JO_Shift_DTO JSFT_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JO_Shift_SP");

            Db.AddInParameter(DbC, "@JSFT_Number", DbType.Int64, JSFT_DTO.JSFT_Number);
            Db.AddInParameter(DbC, "@JSFT_ShiftName", DbType.String, JSFT_DTO.JSFT_ShiftName);
            Db.AddInParameter(DbC, "@JSFT_Description", DbType.String, JSFT_DTO.JSFT_Description);

            Db.AddInParameter(DbC, "@JSFT_DeleteNumbers", DbType.String, JSFT_DTO.JSFT_DeleteNumbers);
            Db.AddInParameter(DbC, "@JSFT_CreatorCode", DbType.Int64, JSFT_DTO.JSFT_CreatorCode);
            Db.AddInParameter(DbC, "@JSFT_Id", DbType.Int32, JSFT_DTO.JSFT_Id);

            DS = Db.ExecuteDataSet(DbC);

            return DS;
        }
    }
}
