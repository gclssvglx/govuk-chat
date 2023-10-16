class FeedbacksController < ApplicationController
  def new
    @feedback = Feedback.new(level: "conversation", uuid: params[:uuid], version: ENV["CONVERSATION_FEEDBACK_VERSION"])
  end

  def create
    @feedback = Feedback.new(feedback_params)
    @feedback.response = params["answers"].to_json

    if @feedback.save
      redirect_to complete_path(uuid: @feedback.uuid)
    end
  end

  def complete
    @uuid = params[:uuid]
  end
  
private

  def feedback_params
    params.require(:feedback).permit(:chat_id, :uuid, :version, :level, :response)
  end
end
